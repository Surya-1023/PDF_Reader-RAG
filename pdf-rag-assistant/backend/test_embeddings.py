
from langchain_huggingface import HuggingFaceEmbeddings

print("Loading HuggingFace embedding model...")

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

print("Model loaded successfully!")

text = "Retrieval Augmented Generation uses external knowledge."

vector = embeddings.embed_query(text)

print("Embedding generated successfully!")
print("Vector dimensions:", len(vector))
print("First 5 values:", vector[:5])
