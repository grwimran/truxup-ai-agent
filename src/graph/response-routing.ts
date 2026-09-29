import {
  GraphStateType,
} from "./state";

export function routeAfterValidation(
  state: GraphStateType
) {
  /*
   * Maximum two validation attempts.
   *
   * First response:
   *   generate → validate
   *
   * If invalid:
   *   regenerate → validate
   *
   * If still invalid:
   *   allow the response through rather than creating
   *   an infinite LangGraph loop.
   */

  if (
    state.responseValid
  ) {
    return "addAssistantMessage";
  }

  if (
    state.responseRevisionCount >= 1
  ) {
    console.warn(
      "Response still failed validation after regeneration."
    );

    return "addAssistantMessage";
  }

  return "regenerateResponse";
}