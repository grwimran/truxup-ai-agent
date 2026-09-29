import "dotenv/config";

import { createClient } from "@supabase/supabase-js";

import { LeadProfile } from "../types";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing"
  );
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

export async function saveLead(
  threadId: string,
  lead: LeadProfile
) {
  const { data, error } = await supabase
    .from("truxup_leads")
    .upsert(
      {
        thread_id: threadId,

        company_name:
          lead.companyName,

        customer_type:
          lead.customerType,

        company_size:
          lead.companySize,

        current_tms:
          lead.currentTms,

        pain_point:
          lead.painPoint,

        buying_intent:
          lead.buyingIntent,

        demo_requested:
          lead.demoRequested,
        
        timeline: lead.timeline,

        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict: "thread_id",
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to save lead: ${error.message}`
    );
  }

  return data;
}