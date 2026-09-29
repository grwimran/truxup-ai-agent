import {
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";

import { GraphStateType } from "../state";

export function addUserMessageNode(
  state: GraphStateType
) {
  return {
    messages: [
      new HumanMessage(state.userMessage),
    ],
  };
}

export function addAssistantMessageNode(
  state: GraphStateType
) {
  return {
    messages: [
      new AIMessage(state.response),
    ],
  };
}