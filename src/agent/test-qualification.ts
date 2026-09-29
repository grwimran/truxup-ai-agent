import { emptyLeadProfile } from "../types";
import { extractLeadInformation } from "./qualification";

async function main() {
  const message =
    "Our biggest problem is tracking.";

  const result =
    await extractLeadInformation(
      message,
      emptyLeadProfile()
    );

  console.log(
    JSON.stringify(result, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});