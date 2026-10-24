import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { calculateTrip } from "./calculator.ts";

export const MODEL = "claude-opus-5-5";

/** Request body sent by the assistant UI. */
export const assistantRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(20000),
      }),
    )
    .min(1)
    .max(20),
  /** What the calculator currently shows, as entered by the user. */
  context: z.object({
    carName: z.string().max(200).optional(),
    distanceKm: z.number().nullable(),
    pricePerKwh: z.number().nullable(),
    pricePerLitre: z.number().nullable(),
    availableEvKm: z.number().nullable(),
    maxEvRangeKm: z.number().nullable(),
    evConsumptionPer100Km: z.number().nullable(),
    iceConsumptionPer100Km: z.number().nullable(),
    batteryKwh: z.number().nullable(),
  }),
});

export type AssistantRequest = z.infer<typeof assistantRequestSchema>;

const nonNegative = z.number().min(0);

export const calculateTripTool = betaZodTool({
  name: "calculate_trip",
  description:
    "Calculates the cost of a plug-in hybrid trip in two scenarios: petrol only (empty battery) " +
    "and using the battery charge available at departure, then petrol for the remaining distance. " +
    "Also returns the savings and the break-even electricity price. " +
    "Use it for every number you give the user; never do the arithmetic yourself.",
  inputSchema: z.object({
    distanceKm: nonNegative.describe("Total trip distance in km"),
    pricePerKwh: nonNegative.describe("Electricity price in €/kWh"),
    pricePerLitre: nonNegative.describe("Petrol price in €/L"),
    availableEvKm: nonNegative
      .optional()
      .describe("Electric km left in the battery at departure. Omit for a full battery"),
    maxEvRangeKm: nonNegative.describe("Maximum electric range in km"),
    evConsumptionPer100Km: z.number().positive().describe("Electric consumption in kWh/100 km"),
    iceConsumptionPer100Km: nonNegative.describe("Petrol consumption in L/100 km"),
  }),
  run: async (input) => JSON.stringify(calculateTrip(input, input)),
  eager_input_streaming: true,
});

const SYSTEM_PROMPT = `You are the assistant inside an Italian web app that compares the cost of a plug-in hybrid (PHEV) trip started with a full battery against the same trip on petrol only.

Answer in Italian, briefly and concretely: a few sentences or a short list. Use € with Italian number formatting (e.g. 6,67 €).

How the app calculates:
- Scenario A, petrol only: litres = distance / 100 × petrol consumption; cost = litres × petrol price.
- Scenario B, hybrid: drive electric for the km left in the battery at departure (full battery = the car's electric range), then petrol for the remaining km.
- Break-even electricity price = (petrol consumption × petrol price) / electric consumption. Above that price, driving on petrol is cheaper.

Use the calculate_trip tool for every figure you quote, including "what if" questions with different distances, prices or consumption values. Start from the values the user currently has in the calculator (given in their message) and change only what the question asks. If a needed value is missing, ask for it.

Stay on topic: trip costs, charging versus fuelling, and how to read the results. For anything else, say briefly that you can only help with the calculator.`;

function describeContext(context: AssistantRequest["context"]): string {
  const value = (v: number | null, unit: string) => (v == null ? "non inserito" : `${v} ${unit}`);
  return [
    "Valori attuali nel calcolatore:",
    `- Auto: ${context.carName ?? "non specificata"}`,
    `- Distanza: ${value(context.distanceKm, "km")}`,
    `- Elettricità: ${value(context.pricePerKwh, "€/kWh")}`,
    `- Benzina: ${value(context.pricePerLitre, "€/L")}`,
    `- Km elettrici alla partenza: ${context.availableEvKm == null ? "batteria piena" : `${context.availableEvKm} km`}`,
    `- Autonomia EV: ${value(context.maxEvRangeKm, "km")}`,
    `- Consumo elettrico: ${value(context.evConsumptionPer100Km, "kWh/100 km")}`,
    `- Consumo benzina: ${value(context.iceConsumptionPer100Km, "L/100 km")}`,
    `- Batteria: ${value(context.batteryKwh, "kWh")}`,
  ].join("\n");
}

class TruncatedToolInput extends Error {}

/**
 * Runs the assistant and yields the answer text as it streams.
 * The calculator context is prepended to the latest user message so the stable
 * system prompt and earlier turns stay cacheable.
 */
export async function* streamAnswer(client: Anthropic, request: AssistantRequest): AsyncGenerator<string> {
  const history = request.messages.slice(0, -1);
  const latest = request.messages[request.messages.length - 1];

  const messages: Anthropic.Beta.BetaMessageParam[] = [
    ...history,
    { role: "user", content: `${describeContext(request.context)}\n\nDomanda: ${latest.content}` },
  ];

  let runner = client.beta.messages.toolRunner({
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: "medium" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    tools: [calculateTripTool],
    messages,
    stream: true,
  });

  // With eager input streaming a tool input may arrive as unparseable JSON, which rejects the
  // iteration. Re-issue the turn from the conversation so far, a limited number of times.
  for (let attempt = 0; ; attempt++) {
    try {
      for await (const messageStream of runner) {
        for await (const event of messageStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            yield event.delta.text;
          }
        }

        const message = await messageStream.finalMessage();
        attempt = 0;
        const hasToolUse = message.content.some((b) => b.type === "tool_use");
        if (message.stop_reason === "max_tokens" && hasToolUse) {
          throw new TruncatedToolInput("Tool input truncated");
        }
        if (message.stop_reason === "refusal") {
          yield "\n\nNon posso rispondere a questa domanda.";
          return;
        }
      }
      return;
    } catch (err) {
      if (err instanceof Anthropic.APIError || err instanceof TruncatedToolInput || attempt >= 2) {
        throw err;
      }
      runner = client.beta.messages.toolRunner({ ...runner.params });
    }
  }
}
