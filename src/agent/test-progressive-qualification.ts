import { extractLeadInformation } from "./qualification";
import { emptyLeadProfile, LeadProfile } from "../types";

async function main() {
  let lead: LeadProfile = emptyLeadProfile();

  const messages = [
    "We're ABC Logistics.",
    "We're a carrier with about 50 trucks.",
    "We currently use spreadsheets.",
    "Our biggest problem is tracking.",
    "I'd like to see a demo.",
  ];

  for (const message of messages) {
    console.log("\n----------------------------------------");
    console.log("CUSTOMER:");
    console.log(message);

    lead = await extractLeadInformation(message, lead);

    console.log("\nUPDATED LEAD:");
    console.log(JSON.stringify(lead, null, 2));
  }

  console.log("\n========================================");
  console.log("FINAL LEAD PROFILE");
  console.log("========================================");
  console.log(JSON.stringify(lead, null, 2));
}

main().catch((error) => {
  console.error("\nProgressive qualification error:");
  console.error(error);
  process.exit(1);
});