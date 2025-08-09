import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings

def initialize_genai():
    """Initialize Google Generative AI components."""
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in environment variables")

    embedding = GoogleGenerativeAIEmbeddings(
        model="embedding-001",
        google_api_key=api_key
    )
    llm_answer = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        temperature=0.2,
        google_api_key=api_key
    )
    llm_prompter = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        temperature=0.8,
        google_api_key=api_key
    )
    return embedding, llm_answer, llm_prompter

if __name__ == "__main__":
    embedding, llm_answer, llm_prompter = initialize_genai()