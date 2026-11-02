
import { useState } from "react";
import {
  FileText,
  Sparkles,
  ShieldCheck,
  Zap,
  BookOpen,
  RotateCcw,
  ArrowUpRight,
  Layers3,
} from "lucide-react";

import PDFUpload from "./components/PDFUpload";
import ChatInterface from "./components/ChatInterface";

function App() {
  const [document, setDocument] = useState(null);

  const handleUploadSuccess = (data) => {
    setDocument(data);
  };

  const handleReset = () => {
    setDocument(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080d19] text-slate-100">

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/[0.06] bg-[#080d19]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
              <FileText size={21} className="text-white" />
            </div>

            <div>
              <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                PDF Intelligence
              </h1>
              <p className="text-[11px] tracking-wide text-slate-500">
                AI DOCUMENT WORKSPACE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-3 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">
              System Online
            </span>
          </div>

        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">

        {!document ? (

          /* Upload Screen */
          <div className="animate-fade-in flex flex-col items-center">

            {/* Hero */}
            <section className="mb-12 max-w-3xl text-center">

              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/[0.08] px-4 py-2 text-xs font-medium text-blue-300">
                <Sparkles size={15} />
                Retrieval Augmented Generation
                <ArrowUpRight size={14} />
              </div>

              <h2 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
                Your documents.
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  Your intelligence.
                </span>
              </h2>

              <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Transform static PDF documents into interactive
                knowledge. Upload, ask questions, and discover
                information with AI-powered answers.
              </p>

            </section>

            {/* Upload Card */}
            <section className="w-full max-w-2xl">

              <div className="rounded-3xl border border-white/[0.08] bg-slate-900/70 p-2 shadow-2xl shadow-black/20 backdrop-blur-xl">

                <PDFUpload onUploadSuccess={handleUploadSuccess} />

              </div>

            </section>

            {/* Features */}
            <section className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">

              <FeatureCard
                icon={<Zap size={19} />}
                title="Fast Responses"
                description="Powered by Groq inference."
              />

              <FeatureCard
                icon={<BookOpen size={19} />}
                title="Source References"
                description="Find answers with PDF page citations."
              />

              <FeatureCard
                icon={<ShieldCheck size={19} />}
                title="Context Aware"
                description="Answers grounded in your document."
              />

            </section>

          </div>

        ) : (

          /* Chat Screen */
          <div className="animate-fade-in mx-auto max-w-5xl">

            {/* Document Header */}
            <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
                  <FileText size={23} className="text-blue-400" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-white sm:text-2xl">
                    Document Workspace
                  </h2>

                  <p className="mt-1 truncate text-sm text-slate-400">
                    {document.filename}
                  </p>
                </div>

              </div>

              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition duration-200 hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white sm:self-auto"
              >
                <RotateCcw size={15} />
                New Document
              </button>

            </div>

            {/* Document Stats */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">

              <StatCard
                icon={<FileText size={17} />}
                label="Pages"
                value={document.total_pages}
              />

              <StatCard
                icon={<Layers3 size={17} />}
                label="Text Chunks"
                value={document.total_chunks}
              />

              <StatCard
                icon={<ShieldCheck size={17} />}
                label="Index Status"
                value="Ready"
              />

            </div>

            {/* Chat */}
            <ChatInterface
              documentId={document.document_id}
              filename={document.filename}
            />

          </div>

        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-6 text-center sm:flex-row sm:px-8">

          <p className="text-xs text-slate-500">
            © 2026 PDF Intelligence. Built for smarter document exploration.
          </p>

          <p className="text-xs text-slate-600">
            React · FastAPI · ChromaDB · HuggingFace · Groq
          </p>

        </div>
      </footer>

    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group rounded-2xl border border-white/[0.06] bg-slate-900/50 p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-500/20 hover:bg-slate-900">

      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition group-hover:bg-blue-500/20">
        {icon}
      </div>

      <h3 className="text-sm font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-slate-900/60 p-4">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 truncate text-sm font-semibold text-white">
          {value}
        </p>
      </div>

    </div>
  );
}

export default App;
