export type LeadProfile = {
  companyName: string | null;
  customerType: string | null;
  companySize: string | null;
  currentTms: string | null;
  painPoint: string | null;
  buyingIntent: string | null;
  demoRequested: boolean;
  timeline: string | null;
};

export type ConversationState = {
  lead: LeadProfile;
  lastUserMessage: string;
  lastAssistantMessage: string | null;
};

export const emptyLeadProfile = (): LeadProfile => ({
  companyName: null,
  customerType: null,
  companySize: null,
  currentTms: null,
  painPoint: null,
  buyingIntent: null,
  demoRequested: false,
  timeline:null
});