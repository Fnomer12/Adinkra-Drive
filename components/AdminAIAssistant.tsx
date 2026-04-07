"use client";

import { useState } from "react";
import { Bot, Send, X, Sparkles } from "lucide-react";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

export default function AdminAIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello Admin. I can help with vehicles, bookings, employees, attendance, members, business insights, and Google Sheet attendance updates.",
    },
  ]);

  async function handleSend() {
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: question }),
      });

      const data = await response.json();

    setMessages((prev) => [
            ...prev,
            {
                role: "assistant",
                content: data.reply || data.answer || "Sorry, I could not process that request.",
            },
            ]);
    } catch (error) {
      console.error("Admin assistant error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong while processing your request.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open && (
        <div className="fixed bottom-6 right-6 z-[120]">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative flex h-16 w-16 items-center justify-center rounded-full border border-blue-400/30 bg-black shadow-[0_0_30px_rgba(59,130,246,0.35)] transition hover:scale-105"
            aria-label="Open admin AI assistant"
          >
            <Bot
              size={24}
              className="text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.9)]"
            />
            <Sparkles
              size={12}
              className="absolute right-3 top-3 text-blue-300"
            />
          </button>
        </div>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-[130] flex h-[620px] w-[400px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-[#30363d] dark:bg-[#161b22]">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-[#30363d]">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Admin AI Assistant
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Attendance, bookings, vehicles, Google Sheets
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-[#21262d]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-4 py-4 dark:bg-[#0d1117]">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "ml-auto bg-black text-white"
                    : "bg-white text-gray-800 shadow-sm dark:bg-[#161b22] dark:text-gray-200"
                }`}
              >
                {message.content}
              </div>
            ))}

            {loading && (
              <div className="max-w-[88%] rounded-2xl bg-white px-4 py-3 text-sm text-gray-500 shadow-sm dark:bg-[#161b22] dark:text-gray-400">
                Thinking...
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 bg-white p-3 dark:border-[#30363d] dark:bg-[#161b22]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSend();
                }}
                placeholder="Ask about attendance, bookings, staff..."
                className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white"
              />

              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={loading}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white disabled:opacity-60"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}