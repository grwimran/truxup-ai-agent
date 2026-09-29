import { checkpointer } from "./checkpointer";

async function main() {
  console.log("========================================");
  console.log("LANGGRAPH MEMORY SETUP");
  console.log("========================================");

  await checkpointer.setup();

  console.log("Checkpoint tables created successfully.");
}

main().catch((error) => {
  console.error("\nMemory setup error:");
  console.error(error);
  process.exit(1);
});