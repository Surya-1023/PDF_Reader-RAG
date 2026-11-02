
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document

print("Loading embedding model...")

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

print("Creating sample documents...")

documents = [
    Document(
        page_content="5G is the fifth generation of mobile network technology.",
        metadata={"source": "sample.pdf", "page": 1}
    ),
    Document(
        page_content="4G LTE provides high-speed mobile internet connectivity.",
        metadata={"source": "sample.pdf", "page": 2}
    ),
    Document(
        page_content="RAG combines information retrieval with language models.",
        metadata={"source": "sample.pdf", "page": 3}
    )
]

print("Creating ChromaDB vector store...")

vector_store = Chroma.from_documents(
    documents=documents,
    embedding=embeddings,
    collection_name="pdf_test_collection",
    persist_directory="./chroma_test_db"
)

print("Documents stored successfully!")

print("Testing similarity search...")

results = vector_store.similarity_search(
    "What is fifth generation mobile network?",
    k=2
)

for result in results:
    print("\nRetrieved document:")
    print(result.page_content)
    print("Metadata:", result.metadata)
