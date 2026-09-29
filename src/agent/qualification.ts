import "dotenv/config";
import { CohereClientV2 } from "cohere-ai";
import { LeadProfile } from "../types";

const COHERE_API_KEY = process.env.COHERE_API_KEY;

if (!COHERE_API_KEY) {
  throw new Error("COHERE_API_KEY is missing from .env");
}

const cohere = new CohereClientV2({
  token: COHERE_API_KEY,
});

const MODEL = "command-a-plus-05-2026";

type ExtractedLead = {
  companyName?: string | null;
  customerType?: string | null;
  companySize?: string | null;
  currentTms?: string | null;
  painPoint?: string | null;
  buyingIntent?: string | null;
  demoRequested?: boolean | null;
  timeline?: string | null;
};





function extractPainPointFallback(
  message: string
): string | null {
  const text = message.toLowerCase();

  if (
    text.includes("problem is tracking") ||
    text.includes("biggest problem is tracking") ||
    text.includes("issue is tracking") ||
    text.includes("tracking is a problem") ||
    text.includes("tracking problem") ||
    text.includes("tracking issues") ||
    text.includes("tracking issue")
  ) {
    return "tracking";
  }

  return null;
}

export async function extractLeadInformation(
  userMessage: string,
  currentLead: LeadProfile
): Promise<LeadProfile> {
  const prompt = `
You are extracting sales qualification information
from a conversation for TruxUp.

Extract ONLY information explicitly stated or clearly
provided by the customer.

Current lead profile:
${JSON.stringify(currentLead, null, 2)}

Customer message:
"${userMessage}"

Return ONLY valid JSON:

{
  "companyName": string | null,
  "customerType": string | null,
  "companySize": string | null,
  "currentTms": string | null,
  "painPoint": string | null,
  "buyingIntent": string | null,
  "demoRequested": boolean | null,
  "timeline": string | null
}

Rules:

- Do not invent information.
- Do not infer information that was not provided.
- If a field is not mentioned, return null.
- customerType examples: carrier, broker, 3PL, fleet.
- companySize should preserve the customer's wording.
- currentTms should preserve the customer's wording.
- painPoint should describe the explicitly stated business problem.
- If the customer explicitly asks for a demo, demoRequested must be true.
- If the customer does not explicitly ask for a demo, demoRequested must be null.
- buyingIntent can be "high", "medium", or "low" only when supported by the message.
`;

  const response = await cohere.chat({
    model: MODEL,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content =
    response.message.content
      ?.map((item) =>
        "text" in item ? item.text : ""
      )
      .join("")
      .trim() ?? "";

  let extracted: ExtractedLead;

  try {
    extracted = JSON.parse(content);
  } catch {
    console.error(
      "Could not parse qualification response:",
      content
    );

    extracted = {};
  }

  // Deterministic fallback for important pain-point phrases.
  const fallbackPainPoint =
    extractPainPointFallback(userMessage);

  const painPoint =
    extracted.painPoint ??
    fallbackPainPoint ??
    currentLead.painPoint;

  const demoRequested =
    extracted.demoRequested ??
    currentLead.demoRequested;

  const buyingIntent =
    demoRequested
      ? "high"
      : extracted.buyingIntent ??
        currentLead.buyingIntent;

  return {
    companyName:
      extracted.companyName ??
      currentLead.companyName,

    customerType:
      extracted.customerType ??
      currentLead.customerType,

    companySize:
      extracted.companySize ??
      currentLead.companySize,

    currentTms:
      extracted.currentTms ??
      currentLead.currentTms,

    painPoint,

    buyingIntent,

    demoRequested,
    timeline:
     extracted.timeline ??
      currentLead.timeline,
  };
}


export function getMissingLeadInformation(
  lead: LeadProfile
): string[] {
  const missing: string[] = [];

  if (!lead.companyName) {
    missing.push("company name");
  }

  if (!lead.customerType) {
    missing.push("customer type");
  }

  if (!lead.companySize) {
    missing.push("company size");
  }

  if (!lead.currentTms) {
    missing.push("current TMS or system");
  }

  if (!lead.painPoint) {
    missing.push("pain point");
  }
   if (!lead.timeline) {
    missing.push("timeline");
  }

  return missing;
}
