"use client";

import { useState } from "react";
import { Bot, Send, X } from "lucide-react";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

export default function GlobalAIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m the Adinkra Drive assistant. Ask me about available cars, rent prices, sale prices, chauffeur service, contact details, or what you can afford with your budget.",
    },
  ]);

  async function handleSend() {
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Sorry, I could not process that request.",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (error) {
      console.error("Assistant send error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong while answering your question.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
   <button
  type="button"
  onClick={() => setOpen(true)}
  className="fixed bottom-6 right-6 z-[100] flex h-16 w-16 items-center justify-center rounded-full 
  bg-gradient-to-br from-[#1a1a1a] to-[#000000] 
  text-white 
  shadow-[0_0_25px_rgba(255,193,7,0.6)] 
  hover:scale-110 hover:shadow-[0_0_40px_rgba(255,193,7,0.9)] 
  transition-all duration-300"
  aria-label="Open AI assistant"
>
  <Bot
    size={24}
    className="text-[#FFC107] drop-shadow-[0_0_10px_rgba(255,193,7,0.9)]"
  />
</button>

      {open && (
        <div className="fixed bottom-6 right-6 z-[110] flex h-[580px] w-[380px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Adinkra Drive AI
              </h3>
              <p className="text-xs text-gray-500">
                Rentals, purchases, contact, budgets
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 hover:bg-gray-100"
              aria-label="Close AI assistant"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "ml-auto bg-black text-white"
                    : "bg-white text-gray-800 shadow-sm"
                }`}
              >
                {message.content}
              </div>
            ))}

            {loading && (
              <div className="max-w-[88%] rounded-2xl bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
                Thinking...
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void handleSend();
                  }
                }}
                placeholder="Ask about cars, price, contact..."
                className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              />

              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={loading}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white disabled:opacity-60"
                aria-label="Send message"
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