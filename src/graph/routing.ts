import { GraphStateType } from "./state";

export function routeByIntent(
  state: GraphStateType
) {
  switch (state.intent) {
    case "product_question":
      return "retrieveKnowledge";

    case "demo_request":
      return "demo";

    case "qualification":
    case "general":
    default:
      return "saveLead";
  }
}