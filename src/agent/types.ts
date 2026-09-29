import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are missing");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from("truxup_documents")
    .select("id")
    .limit(1);

  if (error) {
    console.error("Supabase error:", error);
    return;
  }

  console.log("Supabase connection successful!");
  console.log(data);
}

test();