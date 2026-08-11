import { useState } from "react";
import { Bot, Send, X, Minimize2, Loader2 } from "lucide-react";

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([
    {
      role: "ai",
      text: "Yo! 👋 I'm XTRACT AI. Ask me anything about XTRACT, the channel, videos, playlists, or gaming!",
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: trimmedMessage },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
          "https://xtract-youtube-backend.onrender.com/api/ai/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmedMessage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI request failed");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.reply || "I couldn't generate a response.",
        },
      ]);
    } catch (error) {
      console.error("AI chatbot error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "⚠️ Couldn't connect to XTRACT AI right now. Try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating AI Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
          style={{
            background:
              "linear-gradient(135deg, #7c3aed, #4f46e5)",
            boxShadow:
              "0 0 30px rgba(124,58,237,0.55), 0 8px 25px rgba(0,0,0,0.45)",
          }}
          aria-label="Open XTRACT AI"
        >
          <Bot className="w-7 h-7" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[calc(100vw-2rem)] sm:w-[390px] h-[600px] max-h-[calc(100vh-3rem)] rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: "#0b1020",
            border: "1px solid rgba(124,58,237,0.35)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.65), 0 0 40px rgba(124,58,237,0.18)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(79,70,229,0.12))",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(124,58,237,0.2)",
                border: "1px solid rgba(124,58,237,0.4)",
              }}
            >
              <Bot className="w-5 h-5 text-violet-400" />
            </div>

            <div className="flex-1">
              <h3
                className="text-white font-bold text-sm"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                XTRACT AI
              </h3>

              <p className="text-xs text-slate-500">
                Your gaming assistant
              </p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition"
              aria-label="Close chatbot"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className="max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  style={
                    msg.role === "user"
                      ? {
                          background:
                            "linear-gradient(135deg, #7c3aed, #4f46e5)",
                          color: "white",
                          borderBottomRightRadius: "6px",
                        }
                      : {
                          background: "rgba(255,255,255,0.05)",
                          color: "#cbd5e1",
                          border:
                            "1px solid rgba(255,255,255,0.06)",
                          borderBottomLeftRadius: "6px",
                        }
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl px-4 py-3"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border:
                      "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    XTRACT AI is thinking...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div
            className="p-3"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(0,0,0,0.15)",
            }}
          >
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{
                background: "rgba(255,255,255,0.04)",
                border:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask XTRACT AI..."
                disabled={loading}
                className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-slate-600"
              />

              <button
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white transition-all duration-200 disabled:opacity-30"
                style={{
                  background:
                    "linear-gradient(135deg, #7c3aed, #4f46e5)",
                }}
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-700 mt-2">
              XTRACT AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      )}
    </>
  );
}