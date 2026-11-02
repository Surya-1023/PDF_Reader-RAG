
import { useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Loader2,
  X,
  FileCheck2,
  AlertCircle,
} from "lucide-react";

import api from "../services/api";

function PDFUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return;

    const isPDF =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPDF) {
      setError("Please upload a valid PDF file.");
      setFile(null);
      return;
    }

    if (selectedFile.size === 0) {
      setError("The selected PDF is empty.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleFileChange = (event) => {
    validateFile(event.target.files?.[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const droppedFile = event.dataTransfer.files?.[0];

    validateFile(droppedFile);
  };

  const removeFile = () => {
    setFile(null);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file || loading) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/upload-pdf", formData);

      onUploadSuccess(response.data);

    } catch (err) {
      console.error("PDF upload error:", err);

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(detail.map((item) => item.msg).join(", "));
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Upload failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-3xl border border-white/[0.08] bg-[#101a2d]/90 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">

      {/* Header */}
      <div className="mb-7 text-center">

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-400">
          <UploadCloud size={27} />
        </div>

        <h3 className="text-xl font-bold tracking-tight text-white">
          Upload your document
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Start exploring your PDF with AI-powered intelligence.
        </p>

      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !loading && inputRef.current?.click()}
        className={`group cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 sm:p-10 ${
          dragActive
            ? "scale-[1.01] border-blue-400 bg-blue-500/10"
            : "border-slate-700 bg-[#0b1425]/70 hover:border-blue-400/60 hover:bg-blue-500/[0.04]"
        } ${loading ? "pointer-events-none opacity-60" : ""}`}
      >

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 transition duration-300 group-hover:scale-110 group-hover:bg-blue-500/20">
          <FileText size={32} />
        </div>

        <h4 className="text-base font-semibold text-white">
          {dragActive
            ? "Drop your PDF here"
            : "Drag and drop your PDF"}
        </h4>

        <p className="mt-2 text-sm text-slate-500">
          or{" "}
          <span className="font-semibold text-blue-400">
            browse files
          </span>{" "}
          from your device
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <span className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-400">
            PDF FORMAT
          </span>

          <span className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-400">
            TEXT-BASED PDF
          </span>
        </div>

      </div>

      {/* Selected File */}
      {file && (
        <div className="animate-fade-in mt-5 flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/[0.06] p-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <FileCheck2 size={22} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {file.name}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {formatFileSize(file.size)} · PDF Document
            </p>
          </div>

          <button
            type="button"
            onClick={removeFile}
            disabled={loading}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
            aria-label="Remove selected PDF"
          >
            <X size={18} />
          </button>

        </div>
      )}

      {/* Error */}
      {error && (
        <div className="animate-fade-in mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3 text-sm text-red-400">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Button */}
      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || loading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-300 hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/30 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40"
      >

        {loading ? (
          <>
            <Loader2 size={19} className="animate-spin" />
            Processing your document...
          </>
        ) : (
          <>
            <UploadCloud size={19} />
            Upload and Analyze PDF
          </>
        )}

      </button>

      {/* Footer Note */}
      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
        <CheckCircle2 size={14} className="text-emerald-400" />
        Your document is processed using AI-powered retrieval.
      </div>

    </div>
  );
}

export default PDFUpload;
