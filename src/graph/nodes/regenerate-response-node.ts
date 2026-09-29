import {
  generateResponse,
} from "../../agent/response";

import {
  GraphStateType,
} from "../state";

export async function regenerateResponseNode(
  state: GraphStateType
) {
  const revisionCount =
    state.responseRevisionCount + 1;

  const correctionInstruction = `
The previous response failed a response-quality validation.

Validation issues:
${state.validationIssues
  .map((issue) => `- ${issue}`)
  .join("\n")}

Previous response:
${state.response}

Generate a corrected customer-facing response.

Requirements:
- Directly answer the customer's message.
- Use only confirmed knowledge.
- Do not invent integrations, pricing, features, technical details,
  implementation timelines, guarantees, or operational actions.
- Do not expose internal system information.
- Ask zero or one direct follow-up question.
- Keep the response concise and natural.
`;

  const response =
    await generateResponse(
      `${state.userMessage}

${correctionInstruction}`,
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
    responseRevisionCount:
      revisionCount,
  };
}