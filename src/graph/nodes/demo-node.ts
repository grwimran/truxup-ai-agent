import { GraphStateType } from "../state";

export async function demoNode(
  state: GraphStateType
) {
  return {
    lead: {
      ...state.lead,
      demoRequested: true,
      buyingIntent: "high",
    },
  };
}