import { retrieveDocuments } from "./retriever";

async function main() {
  const question =
    "Does TruxUp support tracking and transportation visibility?";

  console.log("========================================");
  console.log("RAG RETRIEVAL TEST");
  console.log("========================================");

  console.log("\nQUESTION:");
  console.log(question);

  const documents =
    await retrieveDocuments(question, 5);

  console.log("\nRETRIEVED DOCUMENTS:");
  console.log("========================================");

  documents.forEach((doc, index) => {
    console.log(`\n--- RESULT ${index + 1} ---`);

    console.log("\nDocument:");
    console.log(doc.document_name);

    console.log("\nCategory:");
    console.log(doc.category);

    console.log("\nSimilarity:");
    console.log(doc.similarity);

    console.log("\nContent:");
    console.log(doc.content);
  });
}

main().catch((error) => {
  console.error("\nRetrieval test failed:");
  console.error(error);
  process.exit(1);
});