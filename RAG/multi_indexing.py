import os
import uuid
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from odf.opendocument import load
from odf import teletype
import chromadb
from chromadb import Documents, EmbeddingFunction, Embeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from dotenv import load_dotenv

load_dotenv()

@dataclass
class Chunk:
    text: str
    chunk_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

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

class RAPTORVectorStore:
    def __init__(self, persist_directory: str = "./chroma_db", collection_name: str = "raptor_docs"):
        self.persist_directory = persist_directory
        self.collection_name = collection_name
        self.client = chromadb.PersistentClient(path=persist_directory)
        
        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable not set")
        
        self.embedding_function = GoogleEmbeddingFunction(api_key)
        
        try:
            self.collection = self.client.get_collection(
                name=collection_name,
                embedding_function=self.embedding_function
            )
            print(f"Loaded existing collection '{collection_name}' with {self.collection.count()} documents")
        except:
            self.collection = self.client.create_collection(
                name=collection_name,
                embedding_function=self.embedding_function
            )
            print(f"Created new collection '{collection_name}'")
    
    def extract_text_from_odt(self, odt_path: str) -> str:
        """Extract text from ODT file"""
        try:
            doc = load(odt_path)
            extracted_text = []
    
            if hasattr(doc, 'text'):
                def extract_text_recursive(element):
                    text = teletype.extractText(element).strip()
                    if text:
                        extracted_text.append(text)
                    
                    for child in element.childNodes:
                        extract_text_recursive(child)
    
                for element in doc.text.childNodes:
                    extract_text_recursive(element)
    
            return '\n'.join(extracted_text)
        except Exception as e:
            raise ValueError(f"Error processing {odt_path}: {str(e)}")
    
    def load_all_odt_from_folder(self, folder_path: str) -> Dict[str, str]:
        """Load all ODT files from a folder"""
        documents = {}
        absolute_path = os.path.abspath(folder_path)
        
        if not os.path.exists(folder_path):
            raise ValueError(f"Folder {absolute_path} does not exist")
        
        files = [f for f in os.listdir(folder_path) if f.lower().endswith(".odt")]
        
        if not files:
            print(f"Warning: No ODT files found in {folder_path}")
            return documents
        
        for filename in sorted(files):
            filepath = os.path.join(folder_path, filename)
            try:
                text = self.extract_text_from_odt(filepath)
                if text.strip():
                    documents[filename] = text
                    print(f"Loaded: {filename}")
                else:
                    print(f"Warning: Empty text extracted from {filename}")
            except Exception as e:
                print(f"Error loading {filename}: {str(e)}")
        
        return documents
    
    def split_text(self, text: str, doc_name: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[Chunk]:
        """Split text into chunks"""
        try:
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                length_function=len,
                separators=["\n\n", "\n", ". ", " ", ""]
            )
            split_texts = text_splitter.split_text(text)
            return [
                Chunk(
                    text=chunk_text,
                    chunk_id=str(uuid.uuid4()),
                    metadata={"doc_name": doc_name, "chunk_type": "original", "source": "persistent"}
                )
                for chunk_text in split_texts if chunk_text.strip()
            ]
        except Exception as e:
            raise ValueError(f"Error splitting text: {str(e)}")
    
    def add_documents_to_vectorstore(self, folder_path: str):
        """Add documents from folder to persistent vectorstore"""
        try:
            documents = self.load_all_odt_from_folder(folder_path)
            
            if not documents:
                print("No documents found to process")
                return
            
            all_chunks = []
            
            for doc_name, text in documents.items():
                chunks = self.split_text(text, doc_name=doc_name)
                all_chunks.extend(chunks)
                print(f"Created {len(chunks)} chunks for {doc_name}")
            
            if not all_chunks:
                print("No chunks created from documents")
                return
            
            # Add chunks in batches
            batch_size = 100
            total_added = 0
            
            for i in range(0, len(all_chunks), batch_size):
                batch = all_chunks[i:i+batch_size]
                ids = [chunk.chunk_id for chunk in batch]
                texts = [chunk.text for chunk in batch]
                metadatas = [chunk.metadata for chunk in batch]
                
                self.collection.add(
                    ids=ids,
                    documents=texts,
                    metadatas=metadatas
                )
                total_added += len(batch)
                print(f"Added batch {i//batch_size + 1}: {len(batch)} chunks")
            
            print(f"Successfully indexed {total_added} chunks from {len(documents)} documents")
            
        except Exception as e:
            raise ValueError(f"Error adding documents to vector store: {str(e)}")
    
    def get_vectorstore(self):
        """Get the vectorstore collection for querying"""
        return self.collection
    
    def get_collection_info(self):
        """Get information about the collection"""
        try:
            count = self.collection.count()
            return {
                "collection_name": self.collection_name,
                "document_count": count,
                "persist_directory": self.persist_directory
            }
        except Exception as e:
            return {"error": f"Error getting collection info: {str(e)}"}

# Factory function to get vectorstore instance
def get_vectorstore(persist_directory: str = "./chroma_db", collection_name: str = "raptor_docs") -> RAPTORVectorStore:
    """Factory function to get vectorstore instance"""
    return RAPTORVectorStore(persist_directory, collection_name)

if __name__ == "__main__":
    try:
        print("Initializing RAPTOR Vector Store...")
        vectorstore = RAPTORVectorStore()
        
        # Show current collection info
        info = vectorstore.get_collection_info()
        print(f"Collection Info: {info}")
        
        folder_path = "./Docs"
        if os.path.exists(folder_path):
            print(f"Adding documents from {folder_path}...")
            vectorstore.add_documents_to_vectorstore(folder_path)
            
            # Show updated collection info
            info = vectorstore.get_collection_info()
            print(f"Updated Collection Info: {info}")
        else:
            print(f"Warning: Folder {folder_path} does not exist. Please create it and add ODT files.")
            
    except Exception as e:
        print(f"Error: {str(e)}")