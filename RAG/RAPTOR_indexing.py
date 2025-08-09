import os
import uuid
import time
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from odf.opendocument import load
from odf import teletype
import chromadb
from chromadb import Documents, EmbeddingFunction, Embeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sklearn.cluster import KMeans
import re
from dotenv import load_dotenv
import random

load_dotenv()

@dataclass
class Chunk:
    text: str
    level: int
    parent_id: Optional[str] = None
    chunk_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class GoogleEmbeddingFunction(EmbeddingFunction[Documents]):
    def __init__(self, api_key: str):
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=api_key
        )
    
    def __call__(self, input: Documents) -> Embeddings:
        return self.embeddings.embed_documents(input)

class RateLimitedLLM:
    """Wrapper for rate-limited API calls with exponential backoff"""
    
    def __init__(self, llm, base_delay=1.0, max_delay=300.0, max_retries=10):
        self.llm = llm
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.max_retries = max_retries
        self.last_call_time = 0
        self.min_interval = 1.2  # Minimum seconds between API calls
    
    def invoke(self, prompt: str) -> Any:
        """Invoke with rate limiting and exponential backoff"""
        
        # Ensure minimum interval between calls
        current_time = time.time()
        time_since_last = current_time - self.last_call_time
        if time_since_last < self.min_interval:
            sleep_time = self.min_interval - time_since_last
            print(f"Rate limiting: sleeping for {sleep_time:.2f} seconds...")
            time.sleep(sleep_time)
        
        retry_count = 0
        delay = self.base_delay
        
        while retry_count < self.max_retries:
            try:
                self.last_call_time = time.time()
                response = self.llm.invoke(prompt)
                return response
                
            except Exception as e:
                error_msg = str(e)
                
                if "429" in error_msg or "ResourceExhausted" in error_msg or "quota" in error_msg.lower():
                    retry_count += 1
                    
                    # Extract retry delay from error message if available
                    if "retry_delay" in error_msg:
                        try:
                            # Try to extract the retry delay from the error
                            import re
                            delay_match = re.search(r'seconds: (\d+)', error_msg)
                            if delay_match:
                                suggested_delay = int(delay_match.group(1))
                                delay = min(suggested_delay + random.uniform(1, 5), self.max_delay)
                        except:
                            pass
                    
                    if retry_count >= self.max_retries:
                        print(f"Max retries ({self.max_retries}) exceeded. Giving up.")
                        raise e
                    
                    jitter = random.uniform(0.5, 1.5)  # Add jitter to avoid thundering herd
                    sleep_time = min(delay * jitter, self.max_delay)
                    
                    print(f"Rate limit hit. Retry {retry_count}/{self.max_retries}. Sleeping for {sleep_time:.2f} seconds...")
                    time.sleep(sleep_time)
                    
                    # Exponential backoff with cap
                    delay = min(delay * 2, self.max_delay)
                    
                else:
                    # Non-rate-limit error, re-raise immediately
                    raise e
        
        raise Exception(f"Failed after {self.max_retries} retries")

class RAPTORVectorStore:
    def __init__(self, persist_directory: str = "./chroma_db", collection_name: str = "raptor_docs"):
        self.client = chromadb.PersistentClient(path=persist_directory)
        
        # Create custom embedding function
        self.embedding_function = GoogleEmbeddingFunction(os.getenv('GOOGLE_API_KEY'))
        
        # Keep the original embeddings for direct use
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=os.getenv('GOOGLE_API_KEY')
        )
        
        # Wrap LLM with rate limiting
        base_llm = ChatGoogleGenerativeAI(
            model="models/gemini-1.5-flash",
            google_api_key=os.getenv('GOOGLE_API_KEY')
        )
        self.llm = RateLimitedLLM(base_llm, base_delay=2.0, max_delay=300.0, max_retries=15)
        
        self.collection_name = collection_name
        
        try:
            self.collection = self.client.get_collection(
                name=collection_name,
                embedding_function=self.embedding_function
            )
        except:
            self.collection = self.client.create_collection(
                name=collection_name,
                embedding_function=self.embedding_function
            )
    
    def extract_text_from_odt(self, odt_path: str) -> str:
        doc = load(odt_path)
        extracted_text = []
        
        def walk_elements(element):
            if element.qname == (u'urn:oasis:names:tc:opendocument:xmlns:text:1.0', 'h'):
                text = teletype.extractText(element).strip()
                if text:
                    extracted_text.append(f"# {text}")
            elif element.qname == (u'urn:oasis:names:tc:opendocument:xmlns:text:1.0', 'p'):
                text = teletype.extractText(element).strip()
                if text:
                    extracted_text.append(text)
            
            for child in element.childNodes:
                if hasattr(child, 'qname'):
                    walk_elements(child)
        
        walk_elements(doc.text)
        return '\n'.join(extracted_text)
    
    def load_all_odt_from_folder(self, folder_path: str) -> Dict[str, str]:
        documents = {}
        
        if not os.path.exists(folder_path):
            print(f"Warning: Folder {folder_path} does not exist")
            return documents
        
        for filename in sorted(os.listdir(folder_path)):
            if filename.lower().endswith(".odt"):
                filepath = os.path.join(folder_path, filename)
                try:
                    text = self.extract_text_from_odt(filepath)
                    if text:
                        documents[filename] = text
                        print(f"Successfully loaded: {filename}")
                except Exception as e:
                    print(f"Error loading {filename}: {str(e)}")
        
        return documents
    
    def split_text_hierarchically(self, text: str, doc_name: str) -> List[Chunk]:
        chunks = []
        
        doc_id = str(uuid.uuid4())
        print(f"Generating document summary for: {doc_name}")
        doc_summary = self.generate_summary(text)
        chunks.append(Chunk(
            text=doc_summary,
            level=0,
            chunk_id=doc_id,
            metadata={"doc_name": doc_name, "chunk_type": "document_summary"}
        ))
        
        sections = self.split_by_headers(text)
        section_ids = []
        
        for i, section in enumerate(sections):
            section_id = str(uuid.uuid4())
            print(f"Generating section summary {i+1}/{len(sections)} for: {doc_name}")
            section_summary = self.generate_summary(section)
            section_ids.append(section_id)
            
            chunks.append(Chunk(
                text=section_summary,
                level=1,
                parent_id=doc_id,
                chunk_id=section_id,
                metadata={"doc_name": doc_name, "section_index": i, "chunk_type": "section_summary"}
            ))
            
            paragraphs = self.split_into_paragraphs(section)
            for j, paragraph in enumerate(paragraphs):
                if len(paragraph.strip()) > 50:
                    para_id = str(uuid.uuid4())
                    chunks.append(Chunk(
                        text=paragraph,
                        level=2,
                        parent_id=section_id,
                        chunk_id=para_id,
                        metadata={"doc_name": doc_name, "section_index": i, "paragraph_index": j, "chunk_type": "paragraph"}
                    ))
        
        return chunks
    
    def split_by_headers(self, text: str) -> List[str]:
        sections = re.split(r'\n(?=# )', text)
        return [section.strip() for section in sections if section.strip()]
    
    def split_into_paragraphs(self, text: str) -> List[str]:
        text_without_headers = re.sub(r'^# .*$', '', text, flags=re.MULTILINE)
        paragraphs = [p.strip() for p in text_without_headers.split('\n\n') if p.strip()]
        return paragraphs
    
    def generate_summary(self, text: str, max_length: int = 200) -> str:
        if len(text) <= max_length:
            return text
        
        try:
            prompt = f"Summarize the following text in {max_length} characters or less, focusing on key concepts and main points:\n\n{text}"
            response = self.llm.invoke(prompt)
            return response.content.strip()
        except Exception as e:
            print(f"Error generating summary: {str(e)}")
            # Fallback to simple truncation
            return text[:max_length] + "..."
    
    def cluster_and_summarize(self, chunks: List[Chunk], level: int) -> List[Chunk]:
        level_chunks = [chunk for chunk in chunks if chunk.level == level]
        
        if len(level_chunks) <= 2:
            return []
        
        try:
            print(f"Clustering {len(level_chunks)} chunks at level {level}")
            texts = [chunk.text for chunk in level_chunks]
            embeddings = self.embeddings.embed_documents(texts)
            
            n_clusters = min(max(2, len(level_chunks) // 3), 10)
            
            kmeans = KMeans(n_clusters=n_clusters, random_state=42)
            cluster_labels = kmeans.fit_predict(embeddings)
            
            clustered_chunks = []
            for cluster_id in range(n_clusters):
                cluster_chunks = [chunk for i, chunk in enumerate(level_chunks) if cluster_labels[i] == cluster_id]
                
                if len(cluster_chunks) > 1:
                    combined_text = "\n".join([chunk.text for chunk in cluster_chunks])
                    print(f"Generating cluster summary {cluster_id+1}/{n_clusters} at level {level}")
                    summary = self.generate_summary(combined_text, max_length=300)
                    
                    cluster_chunk_id = str(uuid.uuid4())
                    clustered_chunks.append(Chunk(
                        text=summary,
                        level=level - 1,
                        chunk_id=cluster_chunk_id,
                        metadata={"cluster_id": cluster_id, "chunk_type": "cluster_summary", "child_chunks": len(cluster_chunks)}
                    ))
            
            return clustered_chunks
        except Exception as e:
            print(f"Error in clustering: {str(e)}")
            return []
    
    def build_raptor_tree(self, documents: Dict[str, str]) -> List[Chunk]:
        all_chunks = []
        
        for doc_name, text in documents.items():
            print(f"Processing document: {doc_name}")
            doc_chunks = self.split_text_hierarchically(text, doc_name)
            all_chunks.extend(doc_chunks)
        
        current_chunks = all_chunks.copy()
        
        print("Creating level 1 clusters...")
        level_1_clusters = self.cluster_and_summarize(current_chunks, 2)
        all_chunks.extend(level_1_clusters)
        
        print("Creating level 0 clusters...")
        level_0_clusters = self.cluster_and_summarize(all_chunks, 1)
        all_chunks.extend(level_0_clusters)
        
        return all_chunks
    
    def add_documents_to_vectorstore(self, folder_path: str):
        print(f"Loading documents from: {folder_path}")
        documents = self.load_all_odt_from_folder(folder_path)
        
        if not documents:
            print("No documents found to process")
            return
        
        print(f"Found {len(documents)} documents")
        print("Note: This process will take time due to API rate limits. Please be patient...")
        
        chunks = self.build_raptor_tree(documents)
        
        print(f"Generated {len(chunks)} chunks total")
        
        # Split into batches to avoid memory issues
        batch_size = 100
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i+batch_size]
            
            ids = []
            texts = []
            metadatas = []
            
            for chunk in batch:
                ids.append(chunk.chunk_id)
                texts.append(chunk.text)
                
                metadata = chunk.metadata or {}
                metadata.update({
                    "level": chunk.level,
                    "parent_id": chunk.parent_id or ""
                })
                metadatas.append(metadata)
            
            try:
                self.collection.add(
                    ids=ids,
                    documents=texts,
                    metadatas=metadatas
                )
                print(f"Added batch {i//batch_size + 1}/{(len(chunks)-1)//batch_size + 1}")
            except Exception as e:
                print(f"Error adding batch: {str(e)}")
        
        print("Finished adding documents to vector store")

    def search(self, query: str, n_results: int = 10) -> List[Dict[str, Any]]:
        """Search the vector store"""
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results
            )
            
            search_results = []
            for i, doc in enumerate(results['documents'][0]):
                search_results.append({
                    'text': doc,
                    'metadata': results['metadatas'][0][i],
                    'distance': results['distances'][0][i] if results['distances'] else None
                })
            
            return search_results
        except Exception as e:
            print(f"Error searching: {str(e)}")
            return []

if __name__ == "__main__":
    print("Starting RAPTOR Vector Store with Rate Limiting...")
    print("This process will respect API rate limits and may take considerable time.")
    print("The system will automatically retry with exponential backoff when rate limits are hit.\n")
    
    vectorstore = RAPTORVectorStore()
    folder_path = "./Docs"
    
    start_time = time.time()
    vectorstore.add_documents_to_vectorstore(folder_path)
    end_time = time.time()
    
    print(f"\nTotal processing time: {(end_time - start_time)/60:.2f} minutes")
    print("Vector store creation completed!")