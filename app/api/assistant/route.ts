import Anthropic from "@anthropic-ai/sdk";
import { assistantRequestSchema, streamAnswer } from "@/lib/assistant";
import { ASSISTANT_ENABLED } from "@/lib/features";

// Credentials come from ANTHROPIC_API_KEY on the server and never reach the browser.
const anthropic = new Anthropic();
const hasCredentials = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

export async function POST(request: Request) {
  if (!ASSISTANT_ENABLED) {
    return Response.json({ error: "Assistente non attivo." }, { status: 404 });
  }
  if (!hasCredentials) {
    return Response.json({ error: "Assistente non configurato: chiave API mancante." }, { status: 503 });
  }

  const parsed = assistantRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Richiesta non valida." }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const text of streamAnswer(anthropic, parsed.data)) {
          controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        console.error("Assistant request failed", err);
        controller.enqueue(encoder.encode(`\n\n${errorMessage(err)}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function errorMessage(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) return "Assistente non configurato: chiave API mancante o non valida.";
  if (err instanceof Anthropic.RateLimitError) return "Troppe richieste, riprova tra poco.";
  if (err instanceof Anthropic.APIError) return "Il servizio AI non è disponibile in questo momento.";
  return "Si è verificato un errore. Riprova.";
}
