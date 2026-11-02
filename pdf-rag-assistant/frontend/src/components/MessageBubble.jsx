
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  Loader2,
  Sparkles,
  FileText,
  Zap,
  ArrowUp,
} from "lucide-react";

import api from "../services/api";
import MessageBubble from "./MessageBubble";

function ChatInterface({ documentId, filename }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `I've analyzed ${filename}. Ask me anything about your document, and I'll find the relevant information for you.`,
      sources: [],
    },
  ]);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const suggestions = [
    "Summarize this document",
    "What are the key topics?",
    "Explain the important concepts",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const handleSend = async (event, suggestedQuestion) => {
    event?.preventDefault();

    const userQuestion = (suggestedQuestion || question).trim();

    if (!userQuestion || loading) return;

    const userMessage = {
      role: "user",
      content: userQuestion,
    };

    setMessages((previous) => [...previous, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await api.post("/ask", {
        document_id: documentId,
        question: userQuestion,
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
      console.error("Chat error:", error);

      const detail = error.response?.data?.detail;

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            typeof detail === "string"
              ? detail
              : "Something went wrong. Please try again.",
          sources: [],
        },
      ]);

    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const isInitialMessage = messages.length === 1;

  return (
    <div className="animate-fade-in flex h-[650px] w-full flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#101a2d]/90 shadow-2xl shadow-black/30 backdrop-blur-xl sm:h-[720px]">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4 sm:px-6">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 ring-1 ring-blue-400/20">
            <Bot size={22} className="text-blue-400" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white sm:text-base">
              AI Document Assistant
            </h2>

            <p className="truncate text-xs text-slate-500">
              {filename}
            </p>
          </div>

        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

          <span className="text-[11px] font-medium text-emerald-400">
            Ready
          </span>
        </div>

      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-7">

        {isInitialMessage ? (

          <div className="flex min-h-full flex-col items-center justify-center text-center">

            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 ring-1 ring-blue-400/20">
              <Sparkles size={30} className="text-blue-400" />
            </div>

            <h3 className="text-xl font-bold text-white sm:text-2xl">
              Let's explore your document.
            </h3>

            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
              Your PDF is ready. Ask a question or choose one of the suggestions below to get started.
            </p>

            <div className="mt-8 grid w-full max-w-lg gap-3">

              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={(event) => handleSend(event, suggestion)}
                  disabled={loading}
                  className="group flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-left text-sm text-slate-300 transition duration-200 hover:border-blue-400/30 hover:bg-blue-500/[0.06] hover:text-white disabled:opacity-50"
                >
                  <span>{suggestion}</span>

                  <ArrowUp
                    size={16}
                    className="rotate-45 text-slate-600 transition group-hover:text-blue-400"
                  />
                </button>
              ))}

            </div>

            <div className="mt-8">
              <MessageBubble message={messages[0]} />
            </div>

          </div>

        ) : (

          <div className="mx-auto max-w-3xl">

            {messages.map((message, index) => (
              <div
                key={index}
                className="animate-slide-up"
              >
                <MessageBubble message={message} />
              </div>
            ))}

          </div>

        )}

        {loading && (
          <div className="mx-auto mb-6 flex max-w-3xl items-start gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600">
              <Bot size={18} className="text-white" />
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-slate-800/80 px-4 py-3">

              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">
                  Analyzing your document
                </span>

                <Loader2
                  size={15}
                  className="animate-spin text-blue-400"
                />
              </div>

              <div className="mt-2 flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400 [animation-delay:300ms]" />
              </div>

            </div>

          </div>
        )}

        <div ref={messagesEndRef} />

      </div>

      {/* Input Area */}
      <div className="border-t border-white/[0.06] bg-[#0b1425]/70 p-4 sm:p-5">

        <form
          onSubmit={handleSend}
          className="mx-auto max-w-3xl"
        >

          <div className="group flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-800/70 p-2 transition duration-300 focus-within:border-blue-500/60 focus-within:ring-4 focus-within:ring-blue-500/[0.07]">

            <div className="hidden pl-2 text-slate-500 sm:block">
              <FileText size={18} />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask anything about your document..."
              disabled={loading}
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!question.trim() || loading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20 transition duration-200 hover:scale-105 hover:from-blue-500 hover:to-indigo-500 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              {loading ? (
                <Loader2 size={19} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>

          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-600">
            <Zap size={12} className="text-blue-400" />
            Powered by Groq · Answers grounded in your PDF
          </div>

        </form>

      </div>

    </div>
  );
}

export default ChatInterface;
