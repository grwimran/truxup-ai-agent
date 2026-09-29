import {
  detectIntent,
} from "../../agent/conversation";

import { GraphStateType } from "../state";

export async function intentNode(
  state: GraphStateType
) {
  const intent = detectIntent(
    state.userMessage
  );

  return {
    intent,
  };
}