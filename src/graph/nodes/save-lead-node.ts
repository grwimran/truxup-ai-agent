import { saveLead } from "../../leads/lead-store";
import { GraphStateType } from "../state";

export async function saveLeadNode(
  state: GraphStateType
) {
  if (!state.threadId) {
    throw new Error("Graph threadId is missing");
  }

  console.log(
    "SAVING LEAD:",
    JSON.stringify(state.lead, null, 2)
  );

  await saveLead(
    state.threadId,
    state.lead
  );

  return {};
}