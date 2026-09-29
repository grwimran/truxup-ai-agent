import { processConversation } from "./conversation";
import { generateResponse } from "./response";
import {
  ConversationState,
  emptyLeadProfile,
} from "../types";

async function main() {
  let state: ConversationState = {
    lead: emptyLeadProfile(),
    lastUserMessage: "",
    lastAssistantMessage: null,
  };

  const message =
    "Does TruxUp support real-time tracking?";

  const result = await processConversation(
    message,
    state
  );

  state = result.state;

  const answer = await generateResponse(
    message,
    result.intent,
    state,
    result.context
  );

  console.log("========================================");
  console.log("CUSTOMER");
  console.log("========================================");

  console.log(message);

  console.log("\n========================================");
  console.log("INTENT");
  console.log("========================================");

  console.log(result.intent);

  console.log("\n========================================");
  console.log("AI RESPONSE");
  console.log("========================================");

  console.log(answer);
}

main().catch((error) => {
  console.error("\nResponse error:");
  console.error(error);
  process.exit(1);
});