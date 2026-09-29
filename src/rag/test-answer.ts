import { generateAnswer } from "./answer";

async function main() {
  const question =
    "Does TruxUp support tracking and transportation visibility?";

  console.log("========================================");
  console.log("QUESTION");
  console.log("========================================");
  console.log(question);

  console.log("\nGenerating answer...\n");

  const answer = await generateAnswer(question, 5);

  console.log("========================================");
  console.log("TRUXUP AI ANSWER");
  console.log("========================================");
  console.log(answer);
}

main().catch((error) => {
  console.error("\nAnswer generation error:");
  console.error(error);
  process.exit(1);
});