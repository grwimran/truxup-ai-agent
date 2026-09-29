import { extractLeadInformation } from "../../agent/qualification";
import { GraphStateType } from "../state";

export async function qualificationNode(
  state: GraphStateType
) {
  const lead = await extractLeadInformation(
    state.userMessage,
    state.lead
  );

  return {
    lead,
  };
}