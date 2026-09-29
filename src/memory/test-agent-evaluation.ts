import "dotenv/config";

import { truxupGraph } from "../graph/graph";
import { emptyLeadProfile } from "../types";

async function runTest(
  testName: string,
  messages: string[]
) {
  console.log("\n");
  console.log("========================================");
  console.log(`TEST: ${testName}`);
  console.log("========================================");

  const threadId =
    `evaluation-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;

  let firstTurn = true;

  for (const message of messages) {
    console.log("\n----------------------------------------");
    console.log("USER:");
    console.log(message);

    const result = await truxupGraph.invoke(
      firstTurn
        ? {
            threadId,
            userMessage: message,
            lead: emptyLeadProfile(),
            lastAssistantMessage: null,
          }
        : {
            threadId,
            userMessage: message,
          },
      {
        configurable: {
          thread_id: threadId,
        },
      }
    );

    console.log("\nAI:");
    console.log(result.response);

    console.log("\nLEAD:");
    console.log(
      JSON.stringify(result.lead, null, 2)
    );

    firstTurn = false;
  }
}

async function main() {
  await runTest(
    "Confirmed Integration - Samsara",
    [
      "Does TruxUp integrate with Samsara?"
    ]
  );
  await runTest(
  "Confirmed Integration - 123Loadboard",
  [
    "Does TruxUp integrate with 123Loadboard?"
  ]
);

await runTest(
  "Confirmed Integration - AccountMate",
  [
    "Does TruxUp integrate with AccountMate?"
  ]
);

await runTest(
  "Unknown Integration",
  [
    "Does TruxUp integrate with XYZ TMS?"
  ]
);

  await runTest(
    "Business Outcome",
    [
      "Will TruxUp reduce my operating costs?"
    ]
  );

  await runTest(
    "GPS Frequency",
    [
      "How often does TruxUp update GPS locations?"
    ]
  );

  await runTest(
    "ETA Capability",
    [
      "Does TruxUp provide accurate ETAs for every shipment?"
    ]
  );

  await runTest(
    "Operational Request",
    [
      "Dispatch load 123 to John."
    ]
  );

  await runTest(
    "Pricing",
    [
      "How much does TruxUp cost for 50 trucks?"
    ]
  );

  await runTest(
    "Implementation",
    [
      "How long will it take to migrate our spreadsheets to TruxUp?"
    ]
  );

  await runTest(
    "Conversation Memory",
    [
      "We're ABC Logistics.",
      "We're a carrier with about 50 trucks.",
      "We currently use spreadsheets.",
      "Our biggest problem is tracking.",
      "What do you know about our company?"
    ]
  );
}

main().catch((error) => {
  console.error("\nTEST FAILED:");
  console.error(error);
  process.exit(1);
});