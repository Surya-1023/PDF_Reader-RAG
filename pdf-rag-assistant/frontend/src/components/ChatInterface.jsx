
import { useState } from "react";
import { Bot, Send, User, Loader2 } from "lucide-react";
import api from "../services/api";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ChatInterface({ documentId, filename }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello! I've processed ${filename}. You can now ask me questions about your document.`,
    },
  ]);

  const handleSend = async (event) => {
    event.preventDefault();

    const text = question.trim();

    if (!text || loading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", content: text },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await api.post("/ask", {
        document_id: documentId,
        question: text,
        top_k: 3,
      });

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: response.data.answer,
          sources: response.data.sources || [],
        },
      ]);
    } catch (error) {
      console.error("Chat API error:", error);

      const detail = error.response?.data?.detail;

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            typeof detail === "string"
              ? detail
              : "Unable to get an answer. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-6 flex h-[600px] max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">

      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-slate-700 p-5">
        <Bot className="text-emerald-400" size={25} />

        <div>
          <h2 className="font-semibold text-white">
            PDF AI Assistant
          </h2>
          <p className="text-xs text-slate-400">
            {filename}
          </p>
        </div>

        <span className="ml-auto flex items-center gap-2 text-xs text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Ready
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5">

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {message.role === "user" ? (
              <User className="shrink-0 text-blue-400" />
            ) : (
              <Bot className="shrink-0 text-emerald-400" />
            )}

            <div
              className={`max-w-[80%] rounded-xl p-4 text-sm leading-7 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-200"
              }`}
            >
                <div className="prose prose-invert prose-sm max-w-none
                prose-p:leading-7
                prose-headings:text-white
                prose-strong:text-white
                prose-li:my-1
                prose-ul:list-disc
                prose-ol:list-decimal
                prose-ul:pl-5
                prose-ol:pl-5
                text-slate-200">

                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                </ReactMarkdown>

                </div>

              {message.sources?.length > 0 && (
                <div className="mt-3 border-t border-slate-600 pt-3">
                  <p className="mb-2 text-xs font-semibold text-emerald-400">
                    Sources
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {message.sources.map((source, sourceIndex) => (
                      <span
                        key={sourceIndex}
                        className="rounded-lg bg-slate-700 px-3 py-1 text-xs text-slate-300"
                      >
                        {source.source} · Page {source.page}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-3">
            <Bot className="text-emerald-400" size={20} />

            <div className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Thinking...
            </div>
          </div>
        )}

      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="border-t border-slate-700 p-4"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask something about your PDF..."
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="flex items-center justify-center rounded-xl bg-blue-600 px-5 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>

        <p className="mt-2 text-center text-xs text-slate-500">
          Answers are generated using your uploaded PDF.
        </p>
      </form>

    </div>
  );
}

export default ChatInterface;
