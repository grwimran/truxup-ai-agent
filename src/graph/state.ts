import {
  Annotation,
  MessagesAnnotation,
} from "@langchain/langgraph";

import {
  LeadProfile,
  emptyLeadProfile,
} from "../types";

export const GraphState = Annotation.Root({
  // Conversation history
  ...MessagesAnnotation.spec,

  // Current user message
  userMessage: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),

  // Conversation thread
  threadId: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),

  // Sales qualification information
  lead: Annotation<LeadProfile>({
    reducer: (_, next) => next,
    default: () => emptyLeadProfile(),
  }),

  // Detected intent
  intent: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "general",
  }),

  // Retrieved knowledge
  context: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),

  // Generated assistant response
  response: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),

  // Last assistant response
  lastAssistantMessage: Annotation<string | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),

  // Response validation
  responseValid: Annotation<boolean>({
    reducer: (_, next) => next,
    default: () => false,
  }),

  // Validator issues
  validationIssues: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),

  // Number of regeneration attempts
  responseRevisionCount: Annotation<number>({
    reducer: (_, next) => next,
    default: () => 0,
  }),
});

export type GraphStateType =
  typeof GraphState.State;