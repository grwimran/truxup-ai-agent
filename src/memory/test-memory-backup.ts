
import { truxupGraph } from "../graph/graph";
import { emptyLeadProfile } from "../types";

async function runTurn(
  threadId: string,
  message: string,
  firstTurn = false
) {
  const result =
    await truxupGraph.invoke(
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

  console.log(
    "\n========================================"
  );

  console.log("USER:");
  console.log(message);

  console.log("\nLEAD:");
  console.log(
    JSON.stringify(
      result.lead,
      null,
      2
    )
  );

  console.log("\nRESPONSE:");
  console.log(result.response);

  console.log("\nMESSAGE COUNT:");
  console.log(
    result.messages?.length ?? 0
  );

  return result;
}

async function main() {
  /*
   * Use a NEW thread ID for a clean memory test.
   *
   * LangGraph persists conversations by thread_id,
   * so reusing an old ID loads the previous conversation.
   */
  const threadId =
  `test-${Date.now()}`;

  console.log(
    "========================================"
  );

  console.log(
    "LANGGRAPH CONVERSATION MEMORY TEST"
  );

  console.log(
    "========================================"
  );

  await runTurn(
    threadId,
    "We're ABC Logistics.",
    true
  );

  await runTurn(
    threadId,
    "We're a carrier with about 50 trucks."
  );

  await runTurn(
    threadId,
    "We currently use spreadsheets."
  );

  await runTurn(
    threadId,
    "Our biggest problem is tracking."
  );

  const finalResult =
    await runTurn(
      threadId,
      "I'd like to see a demo."
    );

  console.log(
    "\n========================================"
  );

  console.log(
    "FINAL MESSAGE HISTORY"
  );

  console.log(
    "========================================"
  );

  for (
    const message of finalResult.messages ?? []
  ) {
    console.log(
      `\n${message.getType().toUpperCase()}:`
    );

    console.log(
      typeof message.content === "string"
        ? message.content
        : JSON.stringify(message.content)
    );
  }

  console.log(
    "\n========================================"
  );

  console.log("FINAL LEAD");

  console.log(
    "========================================"
  );

  console.log(
    JSON.stringify(
      finalResult.lead,
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(
    "\nMemory test error:"
  );

  console.error(error);

  process.exit(1);
});

