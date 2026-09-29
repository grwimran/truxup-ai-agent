import { truxupGraph } from "./graph";
import { emptyLeadProfile } from "../types";

async function main() {
  const threadId = "abc-logistics-test";

  const messages = [
    "We're ABC Logistics.",
    "We're a carrier with about 50 trucks.",
    "We currently use spreadsheets.",
    "Our biggest problem is tracking.",
    "I'd like to see a demo.",
  ];

  for (const message of messages) {
    console.log("\n========================================");
    console.log("CUSTOMER");
    console.log("========================================");

    console.log(message);

    const result = await truxupGraph.invoke(
      {
        userMessage: message,
        lead: emptyLeadProfile(),
        lastAssistantMessage: null,
      },
      {
        configurable: {
          thread_id: threadId,
        },
      }
    );

    console.log("\nINTENT:");
    console.log(result.intent);

    console.log("\nLEAD:");
    console.log(
      JSON.stringify(result.lead, null, 2)
    );

    console.log("\nRESPONSE:");
    console.log(result.response);
  }
}

main().catch((error) => {
  console.error("\nGraph memory test error:");
  console.error(error);
  process.exit(1);
});