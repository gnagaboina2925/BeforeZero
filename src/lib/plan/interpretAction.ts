import { apiKeyPresent, logInterpretDiagnostic } from "../diagnostics.ts";
import { InterpretInputError } from "../interpretAnswer.ts";
import { completeStructuredJson, getConfiguredModel, ProviderRequestError } from "../xai.ts";
import {
  buildPlanInterpretationPrompt,
  fallbackPlanInterpretation,
  parsePlanInterpretRequest,
  planInterpretationSchema,
  sanitizePlanInterpretation,
} from "./interpret.ts";

export async function interpretPlanUtterance(
  body: unknown,
  deps: {
    apiKey: string | undefined;
    model?: string;
    complete?: typeof completeStructuredJson;
  },
) {
  const parsed = parsePlanInterpretRequest(body);
  if (!parsed.ok) {
    throw new InterpretInputError(parsed.message);
  }
  if (!apiKeyPresent(deps.apiKey)) {
    logInterpretDiagnostic({
      event: "beforezero-interpret",
      hasApiKey: false,
      model: deps.model ?? getConfiguredModel(),
      httpStatus: null,
      reason: "missing_credentials",
      finishReason: null,
      hasMessageContent: false,
      hasRefusal: false,
      jsonParsed: false,
      providerCodeToken: null,
    });
    return fallbackPlanInterpretation(parsed.utterance);
  }
  const prompt = buildPlanInterpretationPrompt(parsed.utterance);
  try {
    const raw = await (deps.complete ?? completeStructuredJson)({
      apiKey: deps.apiKey,
      model: deps.model ?? getConfiguredModel(),
      instructions: prompt.instructions,
      userContent: prompt.userContent,
      schema: planInterpretationSchema(),
      maxCompletionTokens: 800,
    });
    return sanitizePlanInterpretation(raw, parsed.utterance, parsed.round);
  } catch (error) {
    if (error instanceof ProviderRequestError) {
      return fallbackPlanInterpretation(parsed.utterance);
    }
    throw error;
  }
}
