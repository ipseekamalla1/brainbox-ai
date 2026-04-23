// src/app/(dashboard)/student/ai-tutor/page.tsx — AI Tutor Chat Interface

"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestedQuestions = [
  "Explain binary search trees in simple terms",
  "What's the difference between TCP and UDP?",
  "How does backpropagation work in neural networks?",
  "Explain the concept of polymorphism in OOP",
];

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  const sendMessage = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || loading) return;

    const userMessage: Message = { role: "user", content: msgText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setStreamingText("");

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          sessionId,
        }),
      });

      if (!res.ok) throw new Error("Failed to connect to AI tutor");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let fullText = "";
      let currentSessionId = sessionId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setStreamingText(fullText);
              }
              if (parsed.sessionId && !currentSessionId) {
                currentSessionId = parsed.sessionId;
                setSessionId(parsed.sessionId);
              }
            } catch {
              // Skip parse errors
            }
          }
        }
      }

      // Add complete assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: fullText }]);
      setStreamingText("");
    } catch (err) {
      console.error("Tutor error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
            🧠
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold">AI Tutor</h1>
            <p className="text-xs text-muted-foreground">
              Ask anything — get university-level explanations
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-border bg-card p-4 space-y-4 scrollbar-thin">
        {/* Empty State */}
        {messages.length === 0 && !streamingText && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="text-4xl mb-4">🧠</div>
            <h2 className="font-serif text-lg font-bold mb-2">
              What would you like to learn?
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Ask me about any topic — I&apos;ll explain it with examples,
              analogies, and step-by-step breakdowns.
            </p>

            {/* Suggested Questions */}
            <div className="grid sm:grid-cols-2 gap-2 max-w-lg w-full">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 text-xs text-muted-foreground hover:text-foreground transition-all leading-relaxed"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-sm flex-shrink-0 mt-1">
                🧠
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-secondary-foreground rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\*(.*?)\*/g, "<em>$1</em>")
                      .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-muted text-xs">$1</code>')
                      .replace(/\n/g, "<br/>"),
                  }}
                />
              ) : (
                msg.content
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold flex-shrink-0 mt-1">
                You
              </div>
            )}
          </div>
        ))}

        {/* Streaming */}
        {streamingText && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-sm flex-shrink-0 mt-1">
              🧠
            </div>
            <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-md bg-secondary text-secondary-foreground text-sm leading-relaxed">
              <div
                dangerouslySetInnerHTML={{
                  __html: streamingText
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/\*(.*?)\*/g, "<em>$1</em>")
                    .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-muted text-xs">$1</code>')
                    .replace(/\n/g, "<br/>"),
                }}
              />
              <span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse ml-0.5 -mb-0.5" />
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && !streamingText && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-sm flex-shrink-0">
              🧠
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-secondary">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 mt-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask anything..."
              className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none max-h-32 scrollbar-thin"
              style={{ minHeight: 48 }}
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity flex-shrink-0"
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              "Send"
            )}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          AI Tutor uses GPT-4 · Responses may not always be accurate
        </p>
      </div>
    </div>
  );
}