"use client";

import { useRef, useState, type FormEvent } from "react";
import type { AssistantRequest } from "@/lib/assistant";
import { withBasePath } from "@/lib/paths";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AssistantSectionProps {
  context: AssistantRequest["context"];
}

const SUGGESTIONS = [
  "Conviene caricare se la luce costa 0,70 €/kWh?",
  "E se il viaggio fosse di 150 km?",
  "Quanto risparmio in un mese facendo questo tragitto 20 volte?",
];

// Older turns are trimmed so a long chat stays within the server's limits.
const MAX_HISTORY = 19;

export function AssistantSection({ context }: AssistantSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const history = [...messages, userMessage].filter((m) => m.content).slice(-MAX_HISTORY);
    while (history[0].role !== "user") history.shift();
    setMessages([...messages, userMessage, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    const appendToAnswer = (chunk: string) =>
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role !== "assistant") return prev;
        next[next.length - 1] = { ...last, content: last.content + chunk };
        return next;
      });

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const body: AssistantRequest = { messages: history, context };
      const response = await fetch(withBasePath("/api/assistant"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const error = await response.json().catch(() => null);
        appendToAnswer(error?.error ?? "L'assistente non è disponibile.");
        return;
      }

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        appendToAnswer(value);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") appendToAnswer("Connessione non riuscita. Sei offline?");
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setMessages([]);
  };

  return (
    <section className="card">
      <h2>Assistente AI</h2>
      <p className="note assistant-intro">
        Chiedi qualcosa sul tuo viaggio: l&apos;assistente usa i valori inseriti sopra.
      </p>

      {messages.length === 0 ? (
        <div className="suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className="ghost" onClick={() => ask(s)}>
              {s}
            </button>
          ))}
        </div>
      ) : (
        <div className="chat" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role}`}>
              {m.content || (loading && i === messages.length - 1 ? "Sto calcolando…" : "")}
            </div>
          ))}
        </div>
      )}

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          aria-label="Domanda per l'assistente"
          placeholder="Es. conviene caricare a 0,60 €/kWh per 120 km?"
          value={input}
          maxLength={4000}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Chiedi
        </button>
        {messages.length > 0 && (
          <button type="button" className="ghost" onClick={handleReset}>
            Nuova chat
          </button>
        )}
      </form>
    </section>
  );
}
