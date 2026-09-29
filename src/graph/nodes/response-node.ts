import { generateResponse } from "../../agent/response";
import { GraphStateType } from "../state";

export async function responseNode(
  state: GraphStateType
) {
  const response =
    await generateResponse(
      state.userMessage,
      state.intent as any,
      {
        lead: state.lead,
        lastUserMessage:
          state.userMessage,
        lastAssistantMessage:
          state.lastAssistantMessage,
      },
      state.context,
      state.messages
    );

  return {
    response,
    lastAssistantMessage:
      response,
  };
}