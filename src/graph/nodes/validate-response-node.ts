import {
  validateResponse,
} from "../../agent/validators/response-validator";

import {
  GraphStateType,
} from "../state";

export async function validateResponseNode(
  state: GraphStateType
) {
  const result =
    validateResponse(
      state.response,
      state.userMessage,
      state.intent as any,
      state.context
    );

  console.log(
    "\nRESPONSE VALIDATION:"
  );

  console.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

  return {
    responseValid:
      result.valid,

    validationIssues:
      result.issues,
  };
}