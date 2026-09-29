import { processConversation } from "./conversation";
import { emptyLeadProfile, ConversationState } from "../types";

async function main() {
  let state: ConversationState = {
    lead: emptyLeadProfile(),
    lastUserMessage: "",
    lastAssistantMessage: null,
  };

  const messages = [
    "We're ABC Logistics.",
    "We're a carrier with about 50 trucks.",
    "We currently use spreadsheets.",
    "Does TruxUp support real-time tracking?",
    "I'd like to see a demo.",
  ];

  for (const message of messages) {
    console.log("\n========================================");
    console.log("CUSTOMER");
    console.log("========================================");
    console.log(message);

    const result = await processConversation(
      message,
      state
    );

    state = result.state;

    console.log("\nINTENT:");
    console.log(result.intent);

    console.log("\nLEAD:");
    console.log(JSON.stringify(state.lead, null, 2));

    if (result.context) {
      console.log("\nRAG CONTEXT:");
      console.log(result.context);
    }
  }

  console.log("\n========================================");
  console.log("FINAL CONVERSATION STATE");
  console.log("========================================");

  console.log(JSON.stringify(state, null, 2));
}

main().catch((error) => {
  console.error("\nConversation error:");
  console.error(error);
  process.exit(1);
});