import { apiKeyPresent, logInterpretDiagnostic, publicMessage } from "../diagnostics.ts";
import { InterpretInputError } from "../interpretAnswer.ts";
import { completeStructuredJson, getConfiguredModel, ProviderRequestError } from "../xai.ts";
import {
  buildLessonInterpretationPrompt,
  lessonInterpretationSchema,
  parseLessonInterpretRequest,
  sanitizeLessonInterpretation,
} from "./interpret.ts";

export async function interpretLessonUtterance(
  body: unknown,
  deps: {
    apiKey: string | undefined;
    model?: string;
    complete?: typeof completeStructuredJson;
  },
) {
  const parsed = parseLessonInterpretRequest(body);
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
  const prompt = buildLessonInterpretationPrompt(parsed.beatId, parsed.utterance);
  const raw = await (deps.complete ?? completeStructuredJson)({
    apiKey: deps.apiKey,
    model: deps.model ?? getConfiguredModel(),
    instructions: prompt.instructions,
    userContent: prompt.userContent,
    schema: lessonInterpretationSchema(),
  });
  return sanitizeLessonInterpretation(raw, parsed.actionIds);
}
