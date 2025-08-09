from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import uvicorn
import os
import io
from qa_engine import create_qa_engine
from multi_indexing import get_vectorstore
import PyPDF2
import tempfile

app = FastAPI(
    title="Adaptive RAG Query API with PDF Support",
    description="API for processing questions using Adaptive RAG with LangGraph, supporting optional PDF document context, intelligent query routing, web search fallback, and both comprehensive and concise responses.",
    version="3.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global QA engine instance
qa_engine = None

def get_qa_engine():
    global qa_engine
    if qa_engine is None:
        qa_engine = create_qa_engine()
    return qa_engine

class QueryRequest(BaseModel):
    question: str
    document_text: Optional[str] = None

    class Config:
        schema_extra = {
            "example": {
                "question": "What is the capital of France?",
                "document_text": "France is a country in Europe. Its capital city is Paris, which is known for the Eiffel Tower."
            }
        }

class AdaptiveQueryResponse(BaseModel):
    long_answer: str
    short_answer: str
    query_info: Optional[Dict[str, Any]] = None

    class Config:
        schema_extra = {
            "example": {
                "long_answer": "France, officially known as the French Republic, is a country located in Western Europe. The capital city of France is Paris, which serves as the political, economic, and cultural center of the nation. Paris is situated in the north-central part of France on the Seine River and is home to approximately 2.1 million people within the city proper, with over 12 million in the greater metropolitan area. The city is renowned worldwide for its iconic landmarks including the Eiffel Tower, Notre-Dame Cathedral, the Louvre Museum, and the Arc de Triomphe. Paris has played a crucial role in French history and continues to be a major global city influencing art, fashion, gastronomy, and culture.",
                "short_answer": "The capital of France is Paris, which is known for the Eiffel Tower and serves as the country's political, economic, and cultural center.",
                "query_info": {
                    "query_type": "factual",
                    "refined_query": "What is the capital city of France?",
                    "sources_used": ["document_retrieval"],
                    "method": "adaptive_rag"
                }
            }
        }

# Legacy response model for backward compatibility
class QueryResponse(BaseModel):
    answer: str
    query_info: Optional[dict] = None

    class Config:
        schema_extra = {
            "example": {
                "answer": "The capital of France is Paris, which is known for the Eiffel Tower.",
                "query_info": {
                    "refined_query": "What is the capital city of France?",
                    "sources_used": ["persistent_docs", "user_document"]
                }
            }
        }

class IndexStatus(BaseModel):
    collection_name: str
    document_count: int
    persist_directory: str
    status: str

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file content"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text_content = []
        
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text.strip():
                text_content.append(text)
        
        extracted_text = '\n'.join(text_content)
        
        if not extracted_text.strip():
            raise ValueError("No text could be extracted from the PDF")
        
        return extracted_text
        
    except Exception as e:
        raise ValueError(f"Error extracting text from PDF: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """Initialize the QA engine on startup"""
    try:
        global qa_engine
        qa_engine = create_qa_engine()
        print("Adaptive QA Engine initialized successfully")
        
        # Check vectorstore status
        vectorstore = get_vectorstore()
        info = vectorstore.get_collection_info()
        print(f"Vectorstore status: {info}")
        
        # Check if required API keys are set
        google_api_key = os.getenv('GOOGLE_API_KEY')
        tavily_api_key = os.getenv('TAVILY_API_KEY')
        
        print(f"Google API Key: {'✓' if google_api_key else '✗'}")
        print(f"Tavily API Key: {'✓' if tavily_api_key else '✗ (Web search disabled)'}")
        
    except Exception as e:
        print(f"Error initializing QA engine: {e}")

@app.get("/", summary="Health check")
async def root():
    return {
        "message": "Adaptive RAG Query API is running",
        "version": "3.0.0",
        "features": [
            "Intelligent query classification (conversational/factual/document-specific)",
            "Adaptive routing with document retrieval and web search fallback",
            "Relevancy checking for retrieved documents",
            "Both comprehensive and concise answer generation",
            "PDF document processing support"
        ],
        "endpoints": [
            "/api/adaptive-answer - POST: Answer questions using Adaptive RAG (returns both long and short answers)",
            "/api/answer - POST: Answer questions with optional document context (legacy endpoint)",
            "/api/answer-with-pdf - POST: Answer questions with optional PDF upload",
            "/api/adaptive-answer-with-pdf - POST: Adaptive RAG with PDF upload (returns both long and short answers)",
            "/api/index-status - GET: Check indexing status",
            "/docs - API documentation"
        ]
    }

@app.get("/api/index-status", response_model=IndexStatus, summary="Get indexing status")
async def get_index_status():
    """Get the current status of the document index"""
    try:
        vectorstore = get_vectorstore()
        info = vectorstore.get_collection_info()
        
        return IndexStatus(
            collection_name=info.get("collection_name", "unknown"),
            document_count=info.get("document_count", 0),
            persist_directory=info.get("persist_directory", "unknown"),
            status="active" if info.get("document_count", 0) > 0 else "empty"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting index status: {str(e)}")

@app.post("/api/adaptive-answer", response_model=AdaptiveQueryResponse, summary="Generate comprehensive answer using Adaptive RAG")
async def adaptive_answer_query(
    question: str = Form(..., description="The question to answer"),
    document_text: Optional[str] = Form(None, description="Optional text document to include in the context")
):
    """
    Answer a question using Adaptive RAG with intelligent routing and both long and short responses.
    
    This endpoint uses LangGraph to:
    1. Classify queries (conversational/factual/document-specific)
    2. Route to appropriate processing (direct LLM, document retrieval, or web search)
    3. Check relevancy of retrieved documents
    4. Generate both comprehensive and concise answers
    
    - **question**: The question to answer
    - **document_text**: Optional text document to include in the context
    """
    try:
        if not question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        if document_text and len(document_text) > 50000:
            raise HTTPException(status_code=400, detail="Document text exceeds maximum length of 50,000 characters")

        engine = get_qa_engine()
        result = engine.process_query(question, document_text)
        
        return AdaptiveQueryResponse(
            long_answer=result["long_answer"],
            short_answer=result["short_answer"],
            query_info=result["query_info"]
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing adaptive query: {str(e)}")

@app.post("/api/adaptive-answer-with-pdf", response_model=AdaptiveQueryResponse, summary="Generate comprehensive answer using Adaptive RAG with PDF upload")
async def adaptive_answer_query_with_pdf(
    question: str = Form(..., description="The question to answer"),
    pdf_file: Optional[UploadFile] = File(None, description="Optional PDF file to include in context")
):
    """
    Answer a question using Adaptive RAG with intelligent routing and PDF support.
    Returns both comprehensive and concise answers.
    
    - **question**: The question to answer
    - **pdf_file**: Optional PDF file to upload and include in the context
    """
    try:
        if not question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        pdf_text = None
        
        if pdf_file:
            # Validate file type
            if not pdf_file.filename.lower().endswith('.pdf'):
                raise HTTPException(status_code=400, detail="Only PDF files are supported")
            
            # Check file size (limit to 10MB)
            file_content = await pdf_file.read()
            if len(file_content) > 10 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="PDF file too large (max 10MB)")
            
            # Extract text from PDF
            try:
                pdf_text = extract_text_from_pdf(file_content)
                print(pdf_text)
                
                # Limit extracted text size
                if len(pdf_text) > 50000:
                    pdf_text = pdf_text[:50000]
                    
            except ValueError as ve:
                raise HTTPException(status_code=400, detail=str(ve))

        engine = get_qa_engine()
        result = engine.process_query(question, pdf_text)
        
        # Add PDF info to query_info
        if result["query_info"] and pdf_file:
            result["query_info"]["pdf_filename"] = pdf_file.filename
        
        return AdaptiveQueryResponse(
            long_answer=result["long_answer"],
            short_answer=result["short_answer"],
            query_info=result["query_info"]
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing adaptive query with PDF: {str(e)}")

@app.post("/api/answer", response_model=QueryResponse, summary="Generate answer for a question with optional text document (Legacy)")
async def answer_query(
    question: str = Form(..., description="The question to answer"),
    document_text: Optional[str] = Form(None, description="Optional text document to include in the context")
):
    """
    Answer a question using the persistent document index and optional document text.
    This is a legacy endpoint that returns only the short answer for backward compatibility.
    
    - **question**: The question to answer
    - **document_text**: Optional text document to include in the context
    """
    try:
        if not question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        if document_text and len(document_text) > 50000:
            raise HTTPException(status_code=400, detail="Document text exceeds maximum length of 50,000 characters")

        engine = get_qa_engine()
        result = engine.process_query(question, document_text)
        
        return QueryResponse(
            answer=result["short_answer"],
            query_info=result["query_info"]
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.post("/api/answer-with-pdf", response_model=QueryResponse, summary="Generate answer for a question with optional PDF upload (Legacy)")
async def answer_query_with_pdf(
    question: str = Form(..., description="The question to answer"),
    pdf_file: Optional[UploadFile] = File(None, description="Optional PDF file to include in context")
):
    """
    Answer a question using the persistent document index and optional PDF upload.
    This is a legacy endpoint that returns only the short answer for backward compatibility.
    
    - **question**: The question to answer
    - **pdf_file**: Optional PDF file to upload and include in the context
    """
    try:
        if not question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        pdf_text = None
        
        if pdf_file:
            # Validate file type
            if not pdf_file.filename.lower().endswith('.pdf'):
                raise HTTPException(status_code=400, detail="Only PDF files are supported")
            
            # Check file size (limit to 10MB)
            file_content = await pdf_file.read()
            if len(file_content) > 10 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="PDF file too large (max 10MB)")
            
            # Extract text from PDF
            try:
                pdf_text = extract_text_from_pdf(file_content)
                
                # Limit extracted text size
                if len(pdf_text) > 50000:
                    pdf_text = pdf_text[:50000]
                    
            except ValueError as ve:
                raise HTTPException(status_code=400, detail=str(ve))

        engine = get_qa_engine()
        result = engine.process_query(question, pdf_text)
        
        # Prepare legacy response format
        query_info = result["query_info"].copy() if result["query_info"] else {}
        if pdf_file:
            query_info["pdf_filename"] = pdf_file.filename
        
        return QueryResponse(
            answer=result["short_answer"],
            query_info=query_info
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query with PDF: {str(e)}")

@app.post("/api/reindex", summary="Reindex documents from the Docs folder")
async def reindex_documents():
    """
    Manually trigger reindexing of documents from the ./Docs folder.
    This will add any new ODT documents to the persistent index.
    """
    try:
        vectorstore = get_vectorstore()
        docs_folder = "./Docs"
        
        if not os.path.exists(docs_folder):
            raise HTTPException(status_code=404, detail=f"Docs folder not found at {docs_folder}")
        
        # Get initial count
        initial_info = vectorstore.get_collection_info()
        initial_count = initial_info.get("document_count", 0)
        
        # Add documents
        vectorstore.add_documents_to_vectorstore(docs_folder)
        
        # Get final count
        final_info = vectorstore.get_collection_info()
        final_count = final_info.get("document_count", 0)
        
        return {
            "status": "success",
            "message": f"Indexing completed. Documents increased from {initial_count} to {final_count}",
            "documents_added": final_count - initial_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reindexing documents: {str(e)}")

@app.get("/api/query-flow", summary="Get information about the Adaptive RAG query flow")
async def get_query_flow():
    """
    Get detailed information about how the Adaptive RAG system processes queries.
    """
    return {
        "adaptive_rag_flow": {
            "1_query_classification": {
                "description": "Classify incoming queries into three types",
                "types": {
                    "conversational": "Greetings, casual chat (e.g., 'How are you?', 'Hello')",
                    "factual": "Questions requiring factual information that might need web search",
                    "document_specific": "Questions that would benefit from document retrieval"
                }
            },
            "2_routing_decision": {
                "conversational": "Route directly to LLM for friendly response",
                "factual_and_document": "Continue to query refinement and retrieval process"
            },
            "3_query_processing": {
                "query_refinement": "Improve query clarity and precision",
                "stepback_generation": "Generate 3 broader related questions for context"
            },
            "4_document_retrieval": {
                "sources": [
                    "Persistent vectorstore (ODT documents)",
                    "PDF document (if provided)",
                    "Hybrid retrieval with BM25 reranking"
                ]
            },
            "5_relevancy_check": {
                "description": "Evaluate if retrieved documents are relevant to the question",
                "actions": {
                    "relevant": "Proceed with document-based answer generation",
                    "not_relevant": "Fall back to web search"
                }
            },
            "6_web_search_fallback": {
                "description": "Use Tavily search when documents are insufficient",
                "triggers": ["No documents retrieved", "Documents not relevant"]
            },
            "7_answer_generation": {
                "long_answer": "Comprehensive, detailed response with thorough coverage",
                "short_answer": "Concise, direct answer suitable for quick consumption"
            }
        },
        "response_format": {
            "adaptive_endpoints": {
                "long_answer": "Comprehensive response with detailed explanations",
                "short_answer": "Concise summary suitable for voice output",
                "query_info": "Metadata about processing (query type, sources used, method)"
            },
            "legacy_endpoints": {
                "answer": "Only short answer for backward compatibility"
            }
        }
    }

if __name__ == "__main__":
    print("Starting Adaptive RAG Query API...")
    print("Make sure to:")
    print("1. Set GOOGLE_API_KEY environment variable (Required)")
    print("2. Set TAVILY_API_KEY environment variable (Optional - for web search)")
    print("3. Create ./Docs folder with ODT files for persistent indexing")
    print("4. Install required dependencies:")
    print("   pip install fastapi uvicorn PyPDF2 langgraph langchain-community tavily-python")
    print("\nNew Adaptive RAG Features:")
    print("- Intelligent query classification and routing")
    print("- Document relevancy checking")
    print("- Web search fallback via Tavily")
    print("- Both comprehensive and concise answer generation")
    print("- Enhanced query processing with step-back prompting")
    
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)