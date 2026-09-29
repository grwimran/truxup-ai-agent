import { extractLeadInformation } from "./qualification";
import { retrieveDocuments } from "../rag/retriever";
import {
  ConversationState,
  emptyLeadProfile,
} from "../types";

export type MessageIntent =
  | "product_question"
  | "qualification"
  | "demo_request"
  | "general";

export type ConversationResult = {
  state: ConversationState;
  intent: MessageIntent;
  context: string;
};

export function detectIntent(message: string): MessageIntent {
  const text = message.toLowerCase();

  const demoKeywords = [
    "demo",
    "meeting",
    "presentation",
    "walkthrough",
    "schedule",
    "book a call",
  ];

  if (
    demoKeywords.some((keyword) =>
      text.includes(keyword)
    )
  ) {
    return "demo_request";
  }

  const productKeywords = [
    "does truxup",
    "can truxup",
    "truxup support",
    "truxup have",
    "tracking",
    "dispatch",
    "route optimization",
    "routing",
    "driver app",
    "mobile app",
    "documents",
    "billing",
    "settlements",
    "reporting",
    "integration",
    "integrations",
    "tms",
  ];

  if (
    productKeywords.some((keyword) =>
      text.includes(keyword)
    )
  ) {
    return "product_question";
  }

  const qualificationKeywords = [
    "we're",
    "we are",
    "our company",
    "we operate",
    "we have",
    "we use",
    "currently use",
    "our biggest problem",
    "our biggest issue",
    "we need",
    "we're looking for",
    "i'm looking for",
  ];

  if (
    qualificationKeywords.some((keyword) =>
      text.includes(keyword)
    )
  ) {
    return "qualification";
  }

  return "general";
}

export async function processConversation(
  userMessage: string,
  previousState?: ConversationState
): Promise<ConversationResult> {
  const currentState: ConversationState =
    previousState ?? {
      lead: emptyLeadProfile(),
      lastUserMessage: "",
      lastAssistantMessage: null,
    };

  const updatedLead = await extractLeadInformation(
    userMessage,
    currentState.lead
  );

  const intent = detectIntent(userMessage);

  let context = "";

  if (
    intent === "product_question" ||
    intent === "demo_request"
  ) {
    const documents = await retrieveDocuments(
      userMessage,
      5
    );

    context = documents
      .map(
        (doc) =>
          `[${doc.document_name}]\n${doc.content}`
      )
      .join("\n\n");
  }

  const updatedState: ConversationState = {
    lead: updatedLead,
    lastUserMessage: userMessage,
    lastAssistantMessage:
      currentState.lastAssistantMessage,
  };

  return {
    state: updatedState,
    intent,
    context,
  };
}