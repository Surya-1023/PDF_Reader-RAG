# PDF Intelligence — RAG Assistant

A full-stack PDF question-answering application built with **React**, **FastAPI**, **ChromaDB**, **Hugging Face embeddings**, and **Groq**.

Upload a PDF, extract and split its text into chunks, store vector embeddings in ChromaDB, and ask questions. The backend retrieves relevant document chunks and sends them to a Groq language model to generate context-grounded answers with source-page information.

## Features

- Upload text-based PDF documents
- Extract PDF text and split it into overlapping chunks
- Generate embeddings with `sentence-transformers/all-MiniLM-L6-v2`
- Store and retrieve document embeddings using ChromaDB
- Ask questions about an uploaded document using retrieval-augmented generation (RAG)
- Generate answers using Groq (`openai/gpt-oss-20b`)
- Display answers and source-page references in a React chat interface

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Python, FastAPI |
| PDF extraction | pypdf |
| Text splitting | LangChain text splitters |
| Embeddings | Hugging Face Sentence Transformers |
| Vector database | ChromaDB |
| LLM inference | Groq |

## Project Structure

```text
pdf-rag-assistant/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env                 # Create locally; do not commit
│   └── chroma_db/           # Created locally; do not commit
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ChatInterface.jsx
    │   │   └── PDFUpload.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

## Prerequisites

- Python 3.10 or newer
- Node.js and npm
- A Groq API key

## Backend Setup

Open a terminal in the `backend` directory.

### 1. Create and activate a virtual environment

**Windows PowerShell:**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install Python dependencies

```powershell
pip install -r requirements.txt
```

### 3. Configure the Groq API key

Create a file named `.env` inside `backend/`:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Do not commit your `.env` file or share your API key.

### 4. Start the FastAPI server

```powershell
uvicorn main:app --reload
```

The backend will be available at:

- API: http://127.0.0.1:8000
- Swagger documentation: http://127.0.0.1:8000/docs

## Frontend Setup

Open another terminal in the `frontend` directory.

### 1. Install npm dependencies

```powershell
npm install
```

### 2. Start the development server

```powershell
npm run dev
```

Open the local URL printed by Vite, usually:

http://localhost:5173

The frontend API client is configured to connect to `http://127.0.0.1:8000`. If your backend runs at a different address, update `frontend/src/services/api.js`.

## How It Works

1. The user uploads a PDF through the React interface.
2. FastAPI extracts the document text.
3. The extracted text is split into smaller, overlapping chunks.
4. Hugging Face creates an embedding for each chunk.
5. ChromaDB stores the embeddings and associated document metadata.
6. When the user asks a question, the backend embeds the question and retrieves the most relevant chunks.
7. The retrieved context is passed to the Groq language model.
8. The generated answer and source information are returned to the React chat interface.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Check whether the backend is running |
| POST | `/upload-pdf` | Upload, process, and index a PDF |
| POST | `/retrieve` | Retrieve relevant chunks from an indexed document |
| POST | `/ask` | Generate an answer using retrieved PDF context |

For request and response schemas, run the backend and open `/docs`.

## Notes

- The application is designed for text-based PDFs. Scanned PDFs may require OCR before text can be extracted.
- The first embedding-model use may download model files.
- ChromaDB data is stored locally in `backend/chroma_db/`.
- Do not upload API keys, virtual environments, `node_modules`, or local vector database files to GitHub.
- Keep the frontend and backend running in separate terminals during local development.

## Future Improvements

- Conversation history and chat-session management
- Support for multiple documents in one knowledge workspace
- Streaming responses
- Improved document and source navigation
- OCR support for scanned PDFs
- Production deployment and authentication

## License

Add a license before distributing or reusing this project publicly.
