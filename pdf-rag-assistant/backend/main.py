from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File, HTTPException
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from io import BytesIO
import uuid
from pydantic import BaseModel

from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()


# -----------------------------------------
# 1. Initialize FastAPI
# -----------------------------------------

app = FastAPI(
    title="PDF RAG Assistant",
    description="Ask questions about your uploaded PDF documents",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------
# 2. Initialize Embedding Model
# -----------------------------------------

print("Loading HuggingFace embedding model...")

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

print("Embedding model loaded successfully!")

print("Initializing Groq LLM...")

llm = ChatGroq(
    model="openai/gpt-oss-20b",
    temperature=0.2
)

print("Groq LLM initialized successfully!")

# -----------------------------------------
# 3. ChromaDB Configuration
# -----------------------------------------

CHROMA_DIR = "./chroma_db"

# -----------------------------------------
# Question Request Model
# -----------------------------------------

class QuestionRequest(BaseModel):
    document_id: str
    question: str
    top_k: int = 3

# -----------------------------------------
# 4. Home Route
# -----------------------------------------

@app.get("/")
def home():
    return {
        "message": "PDF RAG Assistant Backend is running!",
        "status": "success"
    }


# -----------------------------------------
# 5. PDF Upload and Processing
# -----------------------------------------

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):

    # Validate PDF file
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    # Read uploaded file
    pdf_bytes = await file.read()

    if not pdf_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded PDF is empty"
        )

    try:

        # ---------------------------------
        # Extract text page by page
        # ---------------------------------

        pdf = PdfReader(BytesIO(pdf_bytes))

        pages = []

        for page_number, page in enumerate(pdf.pages, start=1):

            page_text = page.extract_text() or ""

            if page_text.strip():

                pages.append({
                    "text": page_text,
                    "page": page_number
                })

        if not pages:
            raise HTTPException(
                status_code=400,
                detail="No extractable text found in this PDF"
            )


        # ---------------------------------
        # Split text into chunks
        # ---------------------------------

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=600,
            chunk_overlap=100,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

        chunks = []

        for page in pages:

            page_chunks = text_splitter.split_text(
                page["text"]
            )

            for chunk in page_chunks:

                chunks.append(
                    Document(
                        page_content=chunk,
                        metadata={
                            "source": file.filename,
                            "page": page["page"]
                        }
                    )
                )

        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="No text chunks could be generated"
            )


        # ---------------------------------
        # Generate unique document ID
        # ---------------------------------

        document_id = str(uuid.uuid4())


        # ---------------------------------
        # Create ChromaDB collection
        # ---------------------------------

        vector_store = Chroma(
            collection_name=f"pdf_{document_id.replace('-', '')}",
            embedding_function=embeddings,
            persist_directory=CHROMA_DIR
        )


        # ---------------------------------
        # Generate embeddings and store
        # ---------------------------------

        vector_store.add_documents(chunks)

        print(
            f"Successfully stored {len(chunks)} chunks "
            f"for document {document_id}"
        )


        # ---------------------------------
        # Return upload response
        # ---------------------------------

        return {
            "message": "PDF uploaded and indexed successfully!",
            "document_id": document_id,
            "filename": file.filename,
            "total_pages": len(pdf.pages),
            "pages_with_text": len(pages),
            "total_chunks": len(chunks),
            "status": "success"
        }


    except HTTPException:
        raise

    except Exception as error:

        print(f"PDF processing error: {error}")

        raise HTTPException(
            status_code=500,
            detail=f"PDF processing failed: {str(error)}"
        )

# -----------------------------------------
# 6. Semantic Retrieval Endpoint
# -----------------------------------------

@app.post("/retrieve")
def retrieve_documents(request: QuestionRequest):

    try:
        # Validate question
        if not request.question.strip():
            raise HTTPException(
                status_code=400,
                detail="Question cannot be empty"
            )

        # Validate document ID
        try:
            document_uuid = uuid.UUID(request.document_id)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid document ID"
            )

        if not 1 <= request.top_k <= 10:
            raise HTTPException(
                status_code=400,
                detail="top_k must be between 1 and 10"
            )

        # Reconstruct the document-specific collection name
        collection_name = f"pdf_{str(document_uuid).replace('-', '')}"

        # Connect to existing ChromaDB collection
        vector_store = Chroma(
            collection_name=collection_name,
            embedding_function=embeddings,
            persist_directory=CHROMA_DIR
        )

        # Perform semantic similarity search
        results = vector_store.similarity_search(
            request.question,
            k=request.top_k
        )

        # Format retrieved chunks
        retrieved_chunks = []

        for result in results:
            retrieved_chunks.append({
                "content": result.page_content,
                "source": result.metadata.get("source"),
                "page": result.metadata.get("page")
            })

        return {
            "document_id": request.document_id,
            "question": request.question,
            "total_results": len(retrieved_chunks),
            "retrieved_chunks": retrieved_chunks
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Retrieval failed: {str(error)}"
        )

# -----------------------------------------
# 7. RAG Answer Generation Endpoint
# -----------------------------------------

@app.post("/ask")
def ask_question(request: QuestionRequest):

    try:

        # Validate question
        if not request.question.strip():
            raise HTTPException(
                status_code=400,
                detail="Question cannot be empty"
            )

        # Validate document ID
        try:
            document_uuid = uuid.UUID(request.document_id)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid document ID"
            )

        # Validate top_k
        if not 1 <= request.top_k <= 10:
            raise HTTPException(
                status_code=400,
                detail="top_k must be between 1 and 10"
            )

        # ---------------------------------
        # 1. Connect to document collection
        # ---------------------------------

        collection_name = (
            f"pdf_{str(document_uuid).replace('-', '')}"
        )

        vector_store = Chroma(
            collection_name=collection_name,
            embedding_function=embeddings,
            persist_directory=CHROMA_DIR
        )

        # ---------------------------------
        # 2. Retrieve relevant chunks
        # ---------------------------------

        results = vector_store.similarity_search(
            request.question,
            k=request.top_k
        )

        if not results:
            raise HTTPException(
                status_code=404,
                detail="No relevant information found"
            )

        # ---------------------------------
        # 3. Prepare context
        # ---------------------------------

        context_parts = []
        sources = []

        for result in results:

            page = result.metadata.get("page")
            source = result.metadata.get("source")

            context_parts.append(
                f"""
                Source: {source}
                Page: {page}

                Content:
                {result.page_content}
                """
            )

            sources.append({
                "source": source,
                "page": page,
                "content": result.page_content
            })

        context = "\n\n".join(context_parts)

        # ---------------------------------
        # 4. Create prompt
        # ---------------------------------

        prompt = f"""
        You are a helpful PDF Question Answering Assistant.

        Answer the user's question using ONLY the information
        provided in the context below.

        Instructions:
        1. Do not use outside knowledge.
        2. Do not invent or assume information.
        3. If the answer is not available in the context,
           clearly say that the uploaded PDF does not contain
           enough information to answer the question.
        4. Give clear and well-structured answers.
        5. Use bullet points when appropriate.

        CONTEXT:
        {context}

        USER QUESTION:
        {request.question}

        ANSWER:
        """

        # ---------------------------------
        # 5. Generate answer using Groq
        # ---------------------------------

        response = llm.invoke(prompt)

        answer = response.content

        # ---------------------------------
        # 6. Return final response
        # ---------------------------------

        return {
            "document_id": request.document_id,
            "question": request.question,
            "answer": answer,
            "sources": sources,
            "total_sources": len(sources),
            "status": "success"
        }

    except HTTPException:
        raise

    except Exception as error:

        print(f"RAG answer generation error: {error}")

        raise HTTPException(
            status_code=500,
            detail=f"Answer generation failed: {str(error)}"
        )