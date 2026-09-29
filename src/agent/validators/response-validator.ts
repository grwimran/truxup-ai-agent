
import { MessageIntent } from "../conversation";

export type ValidationResult = {
  valid: boolean;
  issues: string[];
};

/**
 * Integrations that are explicitly confirmed by the TruxUp knowledge base.
 *
 * IMPORTANT:
 * Mentioning one of these names is not automatically a claim that
 * TruxUp supports the integration. The validator specifically looks
 * for positive integration claims.
 */
const CONFIRMED_INTEGRATIONS = [
  "samsara",
  "motive",
  "promiles",
  "tomtom",
  "fourkites",
  "sage",
  "quickbooks",
  "quickbooks online",
  "edi",
  "descartes",
  "google maps",
  "fleet one",
  "omnitracs",
  "123loadboard",
  "accountmate",
];

/**
 * Internal implementation details that must never appear
 * in customer-facing responses.
 */
const INTERNAL_TERMS = [
  "supabase",
  "postgresql",
  "pgvector",
  "langchain",
  "langgraph",
  "embedding",
  "embeddings",
  "vector database",
  "rag",
  "retrieval pipeline",
  "system prompt",
  "system instruction",
  "internal prompt",
  "chain of thought",
];

/**
 * Claims that imply the agent actually performed an operational
 * trucking action.
 */
const OPERATIONAL_PATTERNS = [
  /\b(i|we)\s+(have\s+)?dispatched\b/i,

  /\b(i|we)\s+(have\s+)?assigned\b/i,

  /\b(i|we)\s+(have\s+)?updated\b/i,

  /\b(i|we)\s+(have\s+)?cancelled\b/i,

  /\b(i|we)\s+(have\s+)?created\s+(the\s+)?load\b/i,

  /\b(i|we)\s+(have\s+)?changed\s+(the\s+)?shipment\b/i,

  /\bload\s+\w+\s+has\s+been\s+dispatched\b/i,

  /\bdriver\s+\w+\s+has\s+been\s+assigned\b/i,

  /\b(i|we)\s+(have\s+)?booked\s+(the\s+)?load\b/i,

  /\b(i|we)\s+(have\s+)?scheduled\s+(the\s+)?shipment\b/i,

  /\b(i|we)\s+(have\s+)?modified\s+(the\s+)?shipment\b/i,
];

/**
 * Positive business-outcome guarantees.
 *
 * These are intentionally strict.
 *
 * Example:
 * "TruxUp will save you 20%" -> invalid
 *
 * A neutral statement such as:
 * "I don't have confirmed data showing a specific cost reduction."
 * is allowed.
 */
const GUARANTEE_PATTERNS = [
  /\b(?:truxup|we|it)\s+(?:guarantee|guarantees|guaranteed)\b/i,

  /\b(?:truxup|we|it)\s+will\s+save\s+(?:you|your)\b/i,

  /\b(?:truxup|we|it)\s+will\s+reduce\s+(?:your|operating)\s+costs?\b/i,

  /\b(?:truxup|we|it)\s+will\s+increase\s+(?:your|company|business|revenue)\b/i,

  /\b(?:truxup|we|it)\s+will\s+(?:improve|increase|boost)\s+(?:your\s+)?(?:revenue|profit|margins?)\b/i,

  /\bguaranteed\s+roi\b/i,

  /\bguaranteed\s+savings?\b/i,

  /\b100%\s+tracking\b/i,

  /\b100%\s+visibility\b/i,

  /\bguaranteed\s+(?:eta|tracking|visibility|accuracy)\b/i,
];

/**
 * Promotional business-outcome statements that are not necessarily
 * guarantees but should still be rejected unless explicitly grounded.
 *
 * This keeps the agent from gradually turning neutral answers into
 * unsupported sales claims.
 */
const UNSUPPORTED_OUTCOME_PATTERNS = [
  /\b(?:truxup|we|it)\s+(?:can|will|helps?|help)\s+(?:you|your)\s+(?:save|reduce)\s+(?:money|costs?|expenses?)\b/i,

  /\b(?:truxup|we|it)\s+(?:can|will|helps?|help)\s+(?:lower|reduce)\s+(?:your\s+)?operating\s+costs?\b/i,

  /\b(?:truxup|we|it)\s+(?:can|will|helps?|help)\s+(?:increase|boost|grow)\s+(?:your\s+)?(?:revenue|profit|margins?)\b/i,

  /\b(?:truxup|we|it)\s+(?:can|will|helps?|help)\s+(?:improve|increase)\s+(?:your\s+)?(?:roi|return\s+on\s+investment)\b/i,

  /\b(?:truxup|we|it)\s+(?:can|will|helps?|help)\s+(?:lower|reduce)\s+(?:operating\s+)?expenses?\b/i,

  /\b(?:customers?|carriers?|fleets?)\s+(?:often|typically|usually|commonly)\s+(?:save|reduce|increase|improve)\b/i,

  /\b(?:customers?|carriers?|fleets?)\s+(?:see|achieve|experience)\s+(?:significant|substantial|major)\s+(?:savings?|roi|revenue|profit)\b/i,
];

/**
 * Specific pricing must not be invented.
 */
const PRICING_PATTERNS = [
  /\$\s?\d+(?:\.\d{1,2})?/i,

  /\b\d+(?:\.\d+)?\s*(?:usd|dollars?)\b/i,

  /\bper\s+(?:truck|user|month|year)\b/i,

  /\b(?:monthly|annual)\s+(?:price|pricing|fee|cost)\s+of\b/i,
];

/**
 * Implementation timelines must not be invented.
 *
 * Example:
 * "Migration takes 2 weeks" -> invalid
 */
const IMPLEMENTATION_TIMELINE_PATTERNS = [
  /\b\d+\s*(?:days?|weeks?|months?)\b/i,

  /\b(?:same day|next day|within a week|within a month)\b/i,

  /\b(?:takes?|take|requires?)\s+(?:a\s+few\s+)?(?:days?|weeks?|months?)\b/i,

  /\b(?:implementation|migration|setup|onboarding)\s+(?:will\s+)?take\b/i,

  /\b(?:implementation|migration|setup|onboarding)\s+(?:can\s+be\s+)?completed\s+(?:in|within)\b/i,
];

/**
 * Unsupported migration factors.
 *
 * The agent should not invent factors such as data volume,
 * number of spreadsheets, number of records, etc. unless
 * those factors are explicitly documented in the KB.
 */
const MIGRATION_FACTOR_PATTERNS = [
  /\bdepends\s+on\s+(?:the\s+)?(?:volume|amount)\s+of\s+(?:data|records)\b/i,

  /\bdepends\s+on\s+(?:data\s+)?volume\b/i,

  /\bdepends\s+on\s+(?:the\s+)?complexity\s+of\s+(?:your\s+)?(?:processes|workflow|data)\b/i,

  /\bdepends\s+on\s+(?:the\s+number\s+of\s+)?(?:spreadsheets|records|trucks)\b/i,

  /\bhow\s+many\s+spreadsheets\b/i,

  /\bhow\s+many\s+records\b/i,

  /\bhow\s+much\s+data\b/i,
];

/**
 * Count actual direct questions.
 *
 * One question is allowed.
 */
function countDirectQuestions(
  response: string
): number {
  return (response.match(/\?/g) || []).length;
}

/**
 * Detect internal implementation details.
 */
function containsInternalInformation(
  response: string
): string[] {
  const issues: string[] = [];

  const lowerResponse =
    response.toLowerCase();

  for (const term of INTERNAL_TERMS) {
    if (lowerResponse.includes(term)) {
      issues.push(
        `Internal implementation term detected: ${term}`
      );
    }
  }

  return issues;
}

/**
 * Detect operational claims.
 */
function containsOperationalClaim(
  response: string
): string[] {
  return OPERATIONAL_PATTERNS
    .filter((pattern) =>
      pattern.test(response)
    )
    .map(
      () =>
        "Response appears to claim that an operational action was performed."
    );
}

/**
 * Detect guarantees.
 *
 * We deliberately do not try to whitelist every possible
 * negative sentence here. Instead, the patterns themselves
 * focus on positive outcome claims.
 */
function containsGuarantee(
  response: string
): string[] {
  const sentences = response.split(
    /(?<=[.!?])\s+/
  );

  const issues: string[] = [];

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();

    // Explicitly negative/uncertain statements are allowed.
    const isNegative =
      /\b(?:don't|do not|doesn't|does not|cannot|can't|not|no)\b/.test(
        lower
      ) ||
      /\b(?:not confirmed|unconfirmed|no confirmed information)\b/.test(
        lower
      );

    if (isNegative) {
      continue;
    }

    for (const pattern of GUARANTEE_PATTERNS) {
      if (pattern.test(sentence)) {
        issues.push(
          "Potential unsupported guarantee or business outcome detected."
        );
        break;
      }
    }
  }

  return issues;
}

/**
 * Detect softer but still unsupported business-outcome claims.
 */
function containsUnsupportedOutcome(
  response: string
): string[] {
  return UNSUPPORTED_OUTCOME_PATTERNS
    .filter((pattern) =>
      pattern.test(response)
    )
    .map(
      () =>
        "Potential unsupported business-outcome claim detected."
    );
}

/**
 * Detect invented pricing.
 */
function containsPricing(
  response: string
): string[] {
  return PRICING_PATTERNS
    .filter((pattern) =>
      pattern.test(response)
    )
    .map(
      () =>
        "Specific pricing information detected."
    );
}

/**
 * Determine whether a sentence containing an integration
 * phrase is actually making a positive support claim.
 *
 * Examples:
 *
 * "TruxUp integrates with Samsara."
 * -> positive claim
 *
 * "I don't have confirmed information that TruxUp integrates
 * with XYZ."
 * -> negative/uncertain claim, allowed
 *
 * "TruxUp does not currently integrate with XYZ."
 * -> negative claim, allowed
 */
function isNegativeIntegrationClaim(
  text: string
): boolean {
  const lower = text.toLowerCase();

  const negativePatterns = [
    /\b(?:don't|do not|doesn't|does not|cannot|can't|not)\b/,
    /\bno confirmed\b/,
    /\bnot confirmed\b/,
    /\bunconfirmed\b/,
    /\bno information\b/,
    /\bdo not have confirmed information\b/,
    /\bdon't have confirmed information\b/,
    /\bnot aware of\b/,
  ];

  return negativePatterns.some(
    (pattern) =>
      pattern.test(lower)
  );
}

/**
 * Detect positive integration claims while allowing
 * properly qualified negative/uncertain statements.
 */
function detectUnconfirmedIntegrationClaims(
  response: string
): string[] {
  const issues: string[] = [];

  /**
   * We inspect sentences independently.
   *
   * This avoids the previous problem where one negative
   * statement could accidentally make the entire response
   * appear safe.
   */
  const sentences =
    response.split(
      /(?<=[.!?])\s+/
    );

  for (const sentence of sentences) {
    const integrationClaimPattern =
      /\b(?:integrates?\s+with|integration\s+with|integrated\s+with|supports?\s+integration\s+with|works\s+with)\s+([a-z0-9][a-z0-9 .&_-]*)/i;

    const match =
      sentence.match(
        integrationClaimPattern
      );

    if (!match) {
      continue;
    }

    const platform =
      match[1]
        .trim()
        .replace(/[.,!?;:]+$/, "")
        .toLowerCase();

    const isKnown =
      CONFIRMED_INTEGRATIONS.some(
        (integration) =>
          platform.includes(integration) ||
          integration.includes(platform)
      );

    if (isKnown) {
      continue;
    }

    /**
     * If the sentence clearly says that the integration
     * is unknown/unconfirmed/not supported, allow it.
     */
    if (
      isNegativeIntegrationClaim(
        sentence
      )
    ) {
      continue;
    }

    issues.push(
      `Potential unconfirmed integration claim: ${match[1].trim()}`
    );
  }

  return issues;
}

/**
 * Detect invented implementation timelines or
 * unsupported migration assumptions.
 */
function validateImplementationClaims(
  response: string,
  userMessage: string
): string[] {
  const issues: string[] = [];

  const lowerUserMessage =
    userMessage.toLowerCase();

  const implementationQuestion =
    /\b(?:implementation|migration|migrate|setup|onboarding|spreadsheet)\b/.test(
      lowerUserMessage
    );

  if (!implementationQuestion) {
    return issues;
  }

  for (
    const pattern of IMPLEMENTATION_TIMELINE_PATTERNS
  ) {
    if (pattern.test(response)) {
      issues.push(
        "Unsupported implementation or migration timeline detected."
      );
      break;
    }
  }

  for (
    const pattern of MIGRATION_FACTOR_PATTERNS
  ) {
    if (pattern.test(response)) {
      issues.push(
        "Unsupported implementation or migration factor detected."
      );
      break;
    }
  }

  return issues;
}

/**
 * Validate the response.
 */
export function validateResponse(
  response: string,
  userMessage: string,
  intent: MessageIntent,
  context: string
): ValidationResult {
  const issues: string[] = [];

  const trimmedResponse =
    response.trim();

  /**
   * Basic response validation.
   */
  if (!trimmedResponse) {
    issues.push(
      "Response is empty."
    );
  }

  /**
   * Only one direct question should normally be asked.
   */
  if (
    countDirectQuestions(
      trimmedResponse
    ) > 1
  ) {
    issues.push(
      "Response contains more than one direct question."
    );
  }

  /**
   * Security / internal architecture.
   */
  issues.push(
    ...containsInternalInformation(
      trimmedResponse
    )
  );

  /**
   * Operational safety.
   */
  issues.push(
    ...containsOperationalClaim(
      trimmedResponse
    )
  );

  /**
   * Unsupported guarantees.
   */
  issues.push(
    ...containsGuarantee(
      trimmedResponse
    )
  );

  /**
   * Unsupported softer business claims.
   */
  issues.push(
    ...containsUnsupportedOutcome(
      trimmedResponse
    )
  );

  /**
   * Integration grounding.
   */
  issues.push(
    ...detectUnconfirmedIntegrationClaims(
      trimmedResponse
    )
  );

  /**
   * Pricing grounding.
   *
   * Only enforce this strongly when the user actually
   * asked about pricing.
   */
  const mentionsPricing =
    /\b(?:pricing|price|cost|fee|subscription)\b/i.test(
      userMessage
    );

  if (mentionsPricing) {
    const pricingIssues =
      containsPricing(
        trimmedResponse
      );

    /**
     * A negative pricing statement is allowed:
     *
     * "I don't have confirmed pricing information."
     *
     * But a response containing an actual dollar amount
     * should fail.
     */
    for (const issue of pricingIssues) {
      const negativePricingStatement =
        /\b(?:don't|do not|doesn't|does not|not have|no confirmed|not confirmed)\b/i.test(
          trimmedResponse
        );

      if (!negativePricingStatement) {
        issues.push(issue);
      }
    }
  }

  /**
   * Product questions require retrieved KB context.
   */
  if (
    intent === "product_question" &&
    !context.trim()
  ) {
    issues.push(
      "Product question has no retrieved knowledge context."
    );
  }

  /**
   * Implementation / migration protection.
   */
  issues.push(
    ...validateImplementationClaims(
      trimmedResponse,
      userMessage
    )
  );

  /**
   * Remove duplicate issues while preserving order.
   */
  const uniqueIssues =
    [...new Set(issues)];

  return {
    valid:
      uniqueIssues.length === 0,

    issues:
      uniqueIssues,
  };
}

