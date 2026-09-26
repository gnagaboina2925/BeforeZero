import { extractProviderClientError } from "./providerError.ts";
import {
  apiKeyPresent,
  classifyHttpFailure,
  logInterpretDiagnostic,
  publicMessage,
  readProviderErrorFields,
  reasonToErrorCode,
  type InterpretReason,
} from "./diagnostics.ts";
import type { InterpretError, InterpretErrorCode } from "./types.ts";

export const DEFAULT_XAI_MODEL = "grok-4.3";
export const XAI_CHAT_COMPLETIONS_URL = "https://api.x.ai/v1/chat/completions";
export const XAI_TIMEOUT_MS = 20_000;

export type XaiCompleteArgs = {
  apiKey: string;
  model: string;
  instructions: string;
  userContent: string;
  schema: Record<string, unknown>;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export class ProviderRequestError extends Error {
  readonly status: number | null;
  readonly code: InterpretErrorCode;
  readonly diagnostic: string;

  constructor(
    code: InterpretErrorCode,
    message: string,
    status: number | null = null,
    diagnostic: string = code,
  ) {
    super(message);
    this.name = "ProviderRequestError";
    this.code = code;
    this.status = status;
    this.diagnostic = diagnostic;
  }
}

export function getConfiguredModel(): string {
  const fromEnv = process.env.XAI_MODEL?.trim();
  return fromEnv || DEFAULT_XAI_MODEL;
}

export function publicInterpretError(
  code: InterpretErrorCode,
  message: string,
  diagnostic?: string,
): InterpretError {
  return { code, message, diagnostic };
}

export function mapProviderFailure(
  status: number,
  payload: unknown = null,
): ProviderRequestError {
  const reason = classifyHttpFailure(status, payload);
  return providerError(reason, status);
}

function providerError(
  reason: InterpretReason,
  status: number | null,
  diagnostic: string = reason,
): ProviderRequestError {
  return new ProviderRequestError(
    reasonToErrorCode(reason),
    publicMessage(reason),
    status,
    diagnostic,
  );
}

export function extractOutputText(payload: unknown): string | null {
  const extracted = extractMessageContent(payload);
  return extracted.text;
}

export function extractMessageContent(payload: unknown): {
  text: string | null;
  finishReason: string | null;
  hasRefusal: boolean;
  objectValue: unknown | null;
} {
  const empty = {
    text: null,
    finishReason: null,
    hasRefusal: false,
    objectValue: null,
  };
  if (!payload || typeof payload !== "object") return empty;
  const record = payload as Record<string, unknown>;

  if (typeof record.output_text === "string" && record.output_text.trim()) {
    return { ...empty, text: record.output_text };
  }

  if (Array.isArray(record.choices) && record.choices[0] && typeof record.choices[0] === "object") {
    const choice = record.choices[0] as Record<string, unknown>;
    const finishReason = typeof choice.finish_reason === "string" ? choice.finish_reason : null;
    const message = choice.message;
    if (message && typeof message === "object") {
      const msg = message as Record<string, unknown>;
      const hasRefusal = typeof msg.refusal === "string" && msg.refusal.length > 0;
      const fromContent = contentToText(msg.content);
      if (fromContent.text || fromContent.objectValue) {
        return {
          text: fromContent.text,
          finishReason,
          hasRefusal,
          objectValue: fromContent.objectValue,
        };
      }
      return { text: null, finishReason, hasRefusal, objectValue: null };
    }
    return { ...empty, finishReason };
  }

  if (Array.isArray(record.output)) {
    for (const item of record.output) {
      if (!item || typeof item !== "object") continue;
      const entry = item as Record<string, unknown>;
      if (entry.type !== "message" || !Array.isArray(entry.content)) continue;
      for (const part of entry.content) {
        if (!part || typeof part !== "object") continue;
        const content = part as Record<string, unknown>;
        if (content.type === "output_text" && typeof content.text === "string") {
          return { ...empty, text: content.text };
        }
      }
    }
  }

  return empty;
}

function contentToText(content: unknown): { text: string | null; objectValue: unknown | null } {
  if (typeof content === "string" && content.trim()) {
    return { text: content, objectValue: null };
  }
  if (content && typeof content === "object" && !Array.isArray(content)) {
    return { text: null, objectValue: content };
  }
  if (Array.isArray(content)) {
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const item = part as Record<string, unknown>;
      if (typeof item.text === "string" && item.text.trim()) {
        return { text: item.text, objectValue: null };
      }
    }
  }
  return { text: null, objectValue: null };
}

export async function completeStructuredJson({
  apiKey,
  model,
  instructions,
  userContent,
  schema,
  timeoutMs = XAI_TIMEOUT_MS,
  fetchImpl = fetch,
}: XaiCompleteArgs): Promise<unknown> {
  const hasApiKey = apiKeyPresent(apiKey);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const log = (
    reason: InterpretReason,
    extra: Partial<Omit<Parameters<typeof logInterpretDiagnostic>[0], "event" | "hasApiKey" | "model" | "reason">>,
    payload?: unknown,
  ) => {
    const clientError = extractProviderClientError(payload);
    logInterpretDiagnostic({
      event: "beforezero-interpret",
      hasApiKey,
      model,
      httpStatus: extra.httpStatus ?? null,
      reason,
      finishReason: extra.finishReason ?? null,
      hasMessageContent: extra.hasMessageContent ?? false,
      hasRefusal: extra.hasRefusal ?? false,
      jsonParsed: extra.jsonParsed ?? false,
      providerCodeToken: extra.providerCodeToken ?? null,
      providerErrorMessage: clientError.providerErrorMessage,
      providerErrorParam: clientError.providerErrorParam,
    });
  };

  try {
    const response = await fetchImpl(XAI_CHAT_COMPLETIONS_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        reasoning_effort: "none",
        max_completion_tokens: 400,
        messages: [
          { role: "system", content: instructions },
          { role: "user", content: userContent },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "rehearsal_interpretation",
            strict: true,
            schema,
          },
        },
      }),
    });

    let payload: unknown = null;
    let jsonParsed = false;
    try {
      payload = await response.json();
      jsonParsed = true;
    } catch {
      jsonParsed = false;
    }

    if (!response.ok) {
      const reason = classifyHttpFailure(response.status, payload);
      const hints = readProviderErrorFields(payload);
      log(reason, {
        httpStatus: response.status,
        jsonParsed,
        providerCodeToken: hints.providerCodeToken,
      }, payload);
      throw providerError(reason, response.status, `${reason}:http_${response.status}`);
    }

    const extracted = extractMessageContent(payload);
    const hasMessageContent = Boolean(extracted.text || extracted.objectValue);
    if (extracted.hasRefusal || !hasMessageContent) {
      log("validation_failed", {
        httpStatus: response.status,
        finishReason: extracted.finishReason,
        hasMessageContent,
        hasRefusal: extracted.hasRefusal,
        jsonParsed,
      });
      throw providerError("validation_failed", response.status, "validation_failed:empty_or_refusal");
    }

    if (extracted.objectValue) {
      return extracted.objectValue;
    }

    try {
      const parsed = JSON.parse(extracted.text as string) as unknown;
      return parsed;
    } catch {
      log("validation_failed", {
        httpStatus: response.status,
        finishReason: extracted.finishReason,
        hasMessageContent: true,
        hasRefusal: extracted.hasRefusal,
        jsonParsed: false,
      });
      throw providerError("validation_failed", response.status, "validation_failed:json");
    }
  } catch (error) {
    if (error instanceof ProviderRequestError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      log("timeout", { httpStatus: null, jsonParsed: false });
      throw providerError("timeout", null, "timeout");
    }
    log("unavailable", { httpStatus: null, jsonParsed: false });
    throw providerError("unavailable", null, "unavailable:network");
  } finally {
    clearTimeout(timer);
  }
}
