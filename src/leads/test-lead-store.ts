import { saveLead } from "./lead-store";

async function main() {
  const lead = {
    companyName: "ABC Logistics",
    customerType: "carrier",
    companySize: "about 50 trucks",
    currentTms: "spreadsheets",
    painPoint: "tracking",
    buyingIntent: "high",
    demoRequested: true,
     timeline: "1-3 months",
  };

  const result = await saveLead(
    "lead-test-20260929",
    lead
  );

  console.log(
    "LEAD SAVED SUCCESSFULLY"
  );

  console.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(
    "\nLead storage test failed:"
  );

  console.error(error);

  process.exit(1);
});