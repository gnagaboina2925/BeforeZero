const PARAM_TOKEN = /^[A-Za-z0-9_.[\]]{1,80}$/;
const MAX_DEV_ERROR_CHARS = 500;

export function redactCredentialLikeText(value: string): string {
  return value
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .replace(/\b(sk-|xai-)[A-Za-z0-9_-]{8,}/gi, "[redacted]")
    .replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
      "[redacted-email]",
    )
    .replace(
      /(api[_-]?key|authorization|secret|token)\s*[:=]\s*\S+/gi,
      "$1=[redacted]",
    )
    .slice(0, MAX_DEV_ERROR_CHARS);
}

export function extractProviderClientError(payload: unknown): {
  providerErrorMessage: string | null;
  providerErrorParam: string | null;
} {
  if (!payload || typeof payload !== "object") {
    return { providerErrorMessage: null, providerErrorParam: null };
  }

  const record = payload as Record<string, unknown>;
  const nested =
    record.error && typeof record.error === "object"
      ? (record.error as Record<string, unknown>)
      : null;

  const messageSource =
    (typeof record.error === "string" ? record.error : null) ??
    (typeof nested?.message === "string" ? nested.message : null) ??
    (typeof record.message === "string" ? record.message : null);

  const paramSource =
    nested?.param ?? nested?.parameter ?? record.param ?? record.parameter;

  const providerErrorParam =
    typeof paramSource === "string" && PARAM_TOKEN.test(paramSource)
      ? paramSource
      : null;

  return {
    providerErrorMessage: messageSource
      ? redactCredentialLikeText(messageSource)
      : null,
    providerErrorParam,
  };
}
