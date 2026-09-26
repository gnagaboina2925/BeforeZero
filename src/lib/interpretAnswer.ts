import { apiKeyPresent, logInterpretDiagnostic, publicMessage } from "./diagnostics.ts";
import {
  buildInterpretationPrompt,
  interpretationSchema,
  parseInterpretRequest,
  permittedChoiceIds,
  sanitizeInterpretation,
} from "./interpret.ts";
import { completeStructuredJson, getConfiguredModel, ProviderRequestError } from "./xai.ts";
import type { InterpretSuccess } from "./types.ts";

export type CompleteStructuredJson = typeof completeStructuredJson;

export async function interpretTypedAnswer(
  body: unknown,
  deps: {
    apiKey: string | undefined;
    model?: string;
    complete?: CompleteStructuredJson;
  },
): Promise<InterpretSuccess> {
  const parsed = parseInterpretRequest(body);
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
    throw new ProviderRequestError(
      "missing_credentials",
      publicMessage("missing_credentials"),
      null,
      "missing_credentials",
    );
  }

  const choiceIds = permittedChoiceIds(parsed.question);
  const prompt = buildInterpretationPrompt(
    parsed.question,
    parsed.data.typedAnswer,
    parsed.data.clarificationExchange,
  );
  const raw = await (deps.complete ?? completeStructuredJson)({
    apiKey: deps.apiKey,
    model: deps.model ?? getConfiguredModel(),
    instructions: prompt.instructions,
    userContent: prompt.userContent,
    schema: interpretationSchema(),
  });

  return sanitizeInterpretation(raw, choiceIds);
}

export class InterpretInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InterpretInputError";
  }
}
