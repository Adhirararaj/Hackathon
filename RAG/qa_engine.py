import os
import re
from typing import Optional, List, Dict, Any, TypedDict
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.schema import Document
from rank_bm25 import BM25Okapi
from langchain.text_splitter import RecursiveCharacterTextSplitter
import chromadb
from chromadb import Documents, EmbeddingFunction, Embeddings
from multi_indexing import get_vectorstore
from langchain_community.tools.tavily_search import TavilySearchResults
from langgraph.graph import StateGraph, END
import uuid
from dotenv import load_dotenv

load_dotenv()

# State definition for the graph
class GraphState(TypedDict):
    question: str
    pdf_text: Optional[str]
    query_type: str  # "conversational", "factual", "document_specific"
    refined_query: str
    step_back_questions: List[str]
    retrieved_docs: List[Document]
    web_search_results: str
    context: str
    long_answer: str
    short_answer: str
    final_response: Dict[str, Any]

class GoogleEmbeddingFunction(EmbeddingFunction[Documents]):
    def __init__(self, api_key: str):
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=api_key
        )
    
    def __call__(self, input: Documents) -> Embeddings:
        try:
            return self.embeddings.embed_documents(input)
        except Exception as e:
            raise ValueError(f"Error generating embeddings: {str(e)}")

class DocumentProcessor:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.embedding_function = GoogleEmbeddingFunction(api_key)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            length_function=len
        )

    def create_temporary_collection(self, pdf_text: str) -> chromadb.Collection:
        """Create a temporary in-memory collection for PDF document"""
        client = chromadb.Client()
        
        collection = client.create_collection(
            name=f"temp_pdf_{uuid.uuid4()}",
            embedding_function=self.embedding_function
        )
        
        # Split PDF text into chunks
        chunks = self.text_splitter.split_text(pdf_text)
        
        if chunks:
            ids = [f"pdf_chunk_{i}" for i in range(len(chunks))]
            metadatas = [{"source": "user_pdf", "chunk_type": "pdf", "chunk_id": chunk_id} 
                        for chunk_id in ids]
            
            collection.add(
                ids=ids,
                documents=chunks,
                metadatas=metadatas
            )
        
        return collection

class AdaptiveQAEngine:
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY environment variable not set")
        
        self.llm = ChatGoogleGenerativeAI(
            model="models/gemini-1.5-flash",
            google_api_key=self.api_key,
            temperature=0.3,
            max_output_tokens=1000
        )
        
        self.doc_processor = DocumentProcessor(self.api_key)
        self.persistent_vectorstore = get_vectorstore()
        
        # Initialize web search tool
        tavily_api_key = os.getenv('TAVILY_API_KEY')
        if tavily_api_key:
            self.web_search = TavilySearchResults(
                api_wrapper_kwargs={"api_key": tavily_api_key},
                max_results=5
            )
        else:
            self.web_search = None
            print("Warning: TAVILY_API_KEY not set, web search will be disabled")
        
        # Build the graph
        self.workflow = self._build_graph()
        
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow"""
        workflow = StateGraph(GraphState)
        
        # Add nodes
        workflow.add_node("classify_query", self.classify_query)
        workflow.add_node("refine_query", self.refine_query)
        workflow.add_node("generate_stepback", self.generate_stepback_questions)
        workflow.add_node("retrieve_documents", self.retrieve_documents)
        workflow.add_node("web_search", self.perform_web_search)
        workflow.add_node("direct_llm", self.direct_llm_response)
        workflow.add_node("check_relevancy", self.check_relevancy)
        workflow.add_node("generate_long_answer", self.generate_long_answer)
        workflow.add_node("generate_short_answer", self.generate_short_answer)
        workflow.add_node("finalize_response", self.finalize_response)
        
        # Set entry point
        workflow.set_entry_point("classify_query")
        
        # Add edges
        workflow.add_conditional_edges(
            "classify_query",
            self.route_after_classification,
            {
                "conversational": "direct_llm",
                "factual": "refine_query",
                "document_specific": "refine_query"
            }
        )
        
        workflow.add_edge("refine_query", "generate_stepback")
        workflow.add_edge("generate_stepback", "retrieve_documents")
        
        workflow.add_conditional_edges(
            "retrieve_documents",
            self.route_after_retrieval,
            {
                "has_docs": "check_relevancy",
                "no_docs": "web_search"
            }
        )
        
        workflow.add_conditional_edges(
            "check_relevancy",
            self.route_after_relevancy_check,
            {
                "relevant": "generate_long_answer",
                "not_relevant": "web_search"
            }
        )
        
        workflow.add_edge("web_search", "generate_long_answer")
        workflow.add_edge("direct_llm", "generate_short_answer")
        workflow.add_edge("generate_long_answer", "generate_short_answer")
        workflow.add_edge("generate_short_answer", "finalize_response")
        workflow.add_edge("finalize_response", END)
        
        return workflow.compile()
    
    def classify_query(self, state: GraphState) -> GraphState:
        """Classify the query type"""
        classification_prompt = PromptTemplate(
            input_variables=["question"],
            template="""Classify the following question into one of these categories:
            - conversational: Greetings, personal questions, casual chat (e.g., "How are you?", "Hello", "What's your name?")
            - factual: Questions requiring factual information that might need web search (e.g., "What's the weather today?", "Who won the latest election?")
            - document_specific: Questions that would benefit from document retrieval (e.g., technical questions, specific procedures, detailed explanations)
            
            Question: {question}
            
            Classification (respond with only one word: conversational, factual, or document_specific):"""
        )
        
        try:
            chain = classification_prompt | self.llm | StrOutputParser()
            classification = chain.invoke({"question": state["question"]}).strip().lower()
            
            if classification not in ["conversational", "factual", "document_specific"]:
                classification = "factual"  # Default fallback
                
            state["query_type"] = classification
            
        except Exception:
            state["query_type"] = "factual"  # Default fallback
            
        return state
    
    def route_after_classification(self, state: GraphState) -> str:
        """Route after query classification"""
        return state["query_type"]
    
    def refine_query(self, state: GraphState) -> GraphState:
        """Refine the user's question for better retrieval"""
        query_refactor_prompt = PromptTemplate(
            input_variables=["question"],
            template="""Refine the following question to make it more precise and clear while maintaining its original intent:
            Original question: {question}
            Refined question:"""
        )
        
        try:
            chain = query_refactor_prompt | self.llm | StrOutputParser()
            refined = chain.invoke({"question": state["question"]})
            state["refined_query"] = refined.strip() if refined.strip() else state["question"]
        except Exception:
            state["refined_query"] = state["question"]
            
        return state
    
    def generate_stepback_questions(self, state: GraphState) -> GraphState:
        """Generate step-back questions for broader context"""
        step_back_prompt = PromptTemplate(
            input_variables=["question"],
            template="""Generate 3 broader, related questions that could help provide context for answering the original question: {question}
            Ensure the questions cover related concepts, such as processes, requirements, or institutions involved.
            Format the output as a numbered list of questions."""
        )
        
        try:
            chain = step_back_prompt | self.llm | StrOutputParser()
            step_back_output = chain.invoke({"question": state["refined_query"]})
            
            step_back_questions = [
                q.strip() for q in re.findall(r'^\d+\.\s*(.*?)$', step_back_output, re.MULTILINE)
                if q.strip()
            ]
            
            state["step_back_questions"] = step_back_questions[:3]  # Limit to 3 questions
            
        except Exception:
            state["step_back_questions"] = []
            
        return state
    
    def retrieve_documents(self, state: GraphState) -> GraphState:
        """Retrieve documents from vectorstore and PDF"""
        all_queries = [state["refined_query"]] + state["step_back_questions"]
        
        # Retrieve from persistent vectorstore
        persistent_docs = self._retrieve_from_collection(
            self.persistent_vectorstore.get_vectorstore(), 
            all_queries, 
            n_results=15
        )
        
        # Process PDF if provided
        pdf_docs = []
        if state["pdf_text"] and state["pdf_text"].strip():
            pdf_text = state["pdf_text"]
            if len(pdf_text) > 50000:
                pdf_text = pdf_text[:50000]
            
            temp_collection = self.doc_processor.create_temporary_collection(pdf_text)
            pdf_docs = self._retrieve_from_collection(temp_collection, all_queries, n_results=10)
        
        # Combine and deduplicate documents
        all_docs = persistent_docs + pdf_docs
        unique_docs = self._deduplicate_documents(all_docs)
        
        # Rerank documents
        top_docs = self._rerank_documents_bm25(unique_docs, state["refined_query"], top_k=8)
        
        state["retrieved_docs"] = top_docs
        return state
    
    def route_after_retrieval(self, state: GraphState) -> str:
        """Route after document retrieval"""
        if state["retrieved_docs"] and len(state["retrieved_docs"]) > 0:
            return "has_docs"
        return "no_docs"
    
    def check_relevancy(self, state: GraphState) -> GraphState:
        """Check if retrieved documents are relevant to the question"""
        if not state["retrieved_docs"]:
            state["context"] = ""
            return state
            
        context = "\n\n".join([doc.page_content for doc in state["retrieved_docs"]])
        
        relevancy_prompt = PromptTemplate(
            input_variables=["question", "context"],
            template="""Determine if the provided context is relevant to answering the question.
            
            Question: {question}
            Context: {context}
            
            Is the context relevant to answering this question? (Answer with only 'relevant' or 'not_relevant'):"""
        )
        
        try:
            chain = relevancy_prompt | self.llm | StrOutputParser()
            relevancy = chain.invoke({
                "question": state["refined_query"],
                "context": context[:4000]  # Limit context for relevancy check
            }).strip().lower()
            
            if "relevant" in relevancy:
                state["context"] = context[:8000]  # Limit full context
            else:
                state["context"] = ""
                
        except Exception:
            state["context"] = context[:8000]  # Default to using context
            
        return state
    
    def route_after_relevancy_check(self, state: GraphState) -> str:
        """Route after relevancy check"""
        if state["context"].strip():
            return "relevant"
        return "not_relevant"
    
    def perform_web_search(self, state: GraphState) -> GraphState:
        """Perform web search using Tavily"""
        if not self.web_search:
            state["web_search_results"] = ""
            return state
            
        try:
            search_results = self.web_search.invoke(state["refined_query"])
            
            # Format search results
            formatted_results = []
            for result in search_results:
                if isinstance(result, dict):
                    content = result.get('content', '')
                    url = result.get('url', '')
                    if content:
                        formatted_results.append(f"Source: {url}\nContent: {content}\n")
            
            state["web_search_results"] = "\n".join(formatted_results)
            
        except Exception as e:
            print(f"Web search error: {e}")
            state["web_search_results"] = ""
            
        return state
    
    def direct_llm_response(self, state: GraphState) -> GraphState:
        """Direct LLM response for conversational queries"""
        direct_prompt = PromptTemplate(
            input_variables=["question"],
            template="""Respond to this conversational question in a friendly, helpful manner:
            
            Question: {question}
            
            Response:"""
        )
        
        try:
            chain = direct_prompt | self.llm | StrOutputParser()
            response = chain.invoke({"question": state["question"]})
            state["long_answer"] = response.strip()
            
        except Exception:
            state["long_answer"] = "I'm here to help! How can I assist you today?"
            
        return state
    
    def generate_long_answer(self, state: GraphState) -> GraphState:
        """Generate a comprehensive long answer"""
        # Prepare context from retrieved docs or web search
        full_context = ""
        if state["context"]:
            full_context = state["context"]
        elif state["web_search_results"]:
            full_context = state["web_search_results"]
        
        long_answer_prompt = PromptTemplate(
            input_variables=["question", "context"],
            template="""Based on the provided context, generate a comprehensive and detailed answer to the question. 
            The answer should be informative, well-structured, and provide thorough coverage of the topic.
            Include relevant details, explanations, and examples where appropriate.
            
            Question: {question}
            Context: {context}
            
            Comprehensive Answer:"""
        )
        
        try:
            chain = long_answer_prompt | self.llm | StrOutputParser()
            long_answer = chain.invoke({
                "question": state["refined_query"],
                "context": full_context
            })
            
            state["long_answer"] = long_answer.strip()
            
        except Exception:
            state["long_answer"] = self._generate_fallback_answer(state["question"])
            
        return state
    
    def generate_short_answer(self, state: GraphState) -> GraphState:
        """Generate a concise short answer from the long answer"""
        short_answer_prompt = PromptTemplate(
            input_variables=["long_answer", "question"],
            template="""Create a concise, direct answer from the following comprehensive response. 
            Keep it brief but informative, suitable for quick reading or voice output.
            Focus on the key points that directly answer the question.
            
            Original Question: {question}
            Long Answer: {long_answer}
            
            Short Answer:"""
        )
        
        try:
            chain = short_answer_prompt | self.llm | StrOutputParser()
            short_answer = chain.invoke({
                "question": state["question"],
                "long_answer": state["long_answer"]
            })
            
            state["short_answer"] = short_answer.strip()
            
        except Exception:
            # Fallback: take first 2 sentences of long answer
            long_sentences = state["long_answer"].split('. ')
            state["short_answer"] = '. '.join(long_sentences[:2]) + '.' if len(long_sentences) > 1 else state["long_answer"]
            
        return state
    
    def finalize_response(self, state: GraphState) -> GraphState:
        """Finalize the response with both long and short answers"""
        state["final_response"] = {
            "long_answer": state["long_answer"],
            "short_answer": state["short_answer"],
            "query_info": {
                "query_type": state["query_type"],
                "refined_query": state.get("refined_query", ""),
                "sources_used": self._get_sources_used(state),
                "method": "adaptive_rag"
            }
        }
        
        return state
    
    def _get_sources_used(self, state: GraphState) -> List[str]:
        """Determine which sources were used"""
        sources = []
        
        if state.get("context"):
            sources.append("document_retrieval")
        if state.get("web_search_results"):
            sources.append("web_search")
        if state.get("pdf_text"):
            sources.append("pdf_document")
        if state["query_type"] == "conversational":
            sources.append("direct_llm")
            
        return sources if sources else ["fallback"]
    
    # Helper methods (keeping the existing implementations)
    def _retrieve_from_collection(self, collection: chromadb.Collection, queries: List[str], n_results: int = 10) -> List[Document]:
        """Retrieve documents from a ChromaDB collection"""
        all_docs = []
        
        for query in queries:
            if not query.strip():
                continue
                
            try:
                results = collection.query(
                    query_texts=[query],
                    n_results=n_results
                )
                
                if results['documents'] and results['documents'][0]:
                    docs = [
                        Document(
                            page_content=doc,
                            metadata=meta if meta else {"source": "unknown"}
                        )
                        for doc, meta in zip(results['documents'][0], results['metadatas'][0])
                        if doc.strip()
                    ]
                    all_docs.extend(docs)
                    
            except Exception as e:
                print(f"Error retrieving from collection: {e}")
                continue
        
        return all_docs
    
    def _deduplicate_documents(self, documents: List[Document]) -> List[Document]:
        """Remove duplicate documents based on chunk_id or content"""
        seen = set()
        unique_docs = []
        
        for doc in documents:
            doc_id = doc.metadata.get('chunk_id')
            if not doc_id:
                doc_id = hash(doc.page_content)
            
            if doc_id not in seen:
                seen.add(doc_id)
                unique_docs.append(doc)
        
        return unique_docs
    
    def _rerank_documents_bm25(self, documents: List[Document], query: str, top_k: int = 5) -> List[Document]:
        """Rerank documents using BM25 scoring"""
        if not documents:
            return []
        
        try:
            tokenized_corpus = [doc.page_content.split() for doc in documents]
            bm25 = BM25Okapi(tokenized_corpus)
            tokenized_query = query.split()
            scores = bm25.get_scores(tokenized_query)
            
            ranked_docs = sorted(
                zip(documents, scores),
                key=lambda x: x[1],
                reverse=True
            )
            
            return [doc for doc, _ in ranked_docs[:top_k]]
            
        except Exception:
            return documents[:top_k]
    
    def _generate_fallback_answer(self, question: str) -> str:
        """Generate a fallback answer using general knowledge"""
        fallback_prompt = PromptTemplate(
            input_variables=["question"],
            template="""Answer the following question based on general knowledge. 
            Provide a helpful and informative response.
            
            Question: {question}
            
            Answer:"""
        )
        
        try:
            chain = fallback_prompt | self.llm | StrOutputParser()
            answer = chain.invoke({"question": question})
            return answer.strip() if answer.strip() else "I'm unable to provide an answer to that question."
            
        except Exception:
            return "I'm unable to provide an answer to that question."
    
    def process_query(self, question: str, pdf_text: Optional[str] = None) -> Dict[str, Any]:
        """Main method to process a query and return both long and short answers"""
        try:
            if not question or not question.strip():
                raise ValueError("Question cannot be empty")
            
            # Initialize state
            initial_state = {
                "question": question,
                "pdf_text": pdf_text,
                "query_type": "",
                "refined_query": "",
                "step_back_questions": [],
                "retrieved_docs": [],
                "web_search_results": "",
                "context": "",
                "long_answer": "",
                "short_answer": "",
                "final_response": {}
            }
            
            # Run the workflow
            final_state = self.workflow.invoke(initial_state)
            
            return final_state["final_response"]
            
        except Exception as e:
            print(f"Error in process_query: {e}")
            fallback_answer = self._generate_fallback_answer(question)
            return {
                "long_answer": fallback_answer,
                "short_answer": fallback_answer,
                "query_info": {
                    "query_type": "fallback",
                    "sources_used": ["fallback"],
                    "method": "error_fallback"
                }
            }

# Factory function
def create_qa_engine() -> AdaptiveQAEngine:
    """Create and return an adaptive QA engine instance"""
    return AdaptiveQAEngine()

# Legacy wrapper for backward compatibility
class QAEngine:
    def __init__(self):
        self.adaptive_engine = AdaptiveQAEngine()
    
    def process_query(self, question: str, pdf_text: Optional[str] = None) -> str:
        """Legacy method that returns only the short answer for backward compatibility"""
        result = self.adaptive_engine.process_query(question, pdf_text)
        return result["short_answer"]

# Main function for standalone testing
def generate_answer(question: str, document: Optional[str] = None) -> str:
    """Wrapper function for backward compatibility"""
    qa_engine = create_qa_engine()
    result = qa_engine.process_query(question, document)
    return result["short_answer"]