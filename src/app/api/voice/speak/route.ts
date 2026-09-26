import { apiKeyPresent, classifyHttpFailure, publicMessage } from "@/lib/diagnostics";
import { parseVoiceContext, TTS_URL, ttsVoice, VOICE_TIMEOUT_MS } from "@/lib/voice";
import { ProviderRequestError, publicInterpretError } from "@/lib/xai";
import { NextResponse } from "next/server";

function jsonError(error: ProviderRequestError | { code: "invalid_request"; message: string }) {
  if (error instanceof ProviderRequestError) {
    const status =
      error.code === "timeout"
        ? 504
        : error.code === "auth_failed"
          ? 401
          : error.code === "missing_credentials"
            ? 503
            : error.code === "invalid_request"
              ? 400
              : 503;
    return NextResponse.json(
      { error: publicInterpretError(error.code, error.message, error.diagnostic) },
      { status },
    );
  }
  return NextResponse.json(
    { error: publicInterpretError("invalid_request", error.message) },
    { status: 400 },
  );
}

export async function POST(request: Request) {
  if (!apiKeyPresent(process.env.XAI_API_KEY)) {
    return jsonError(
      new ProviderRequestError(
        "missing_credentials",
        publicMessage("missing_credentials"),
        null,
        "missing_credentials",
      ),
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError({
      code: "invalid_request",
      message: "Send a JSON object with the rehearsal step.",
    });
  }

  const parsed = parseVoiceContext(body);
  if (!parsed.ok) {
    return jsonError({ code: "invalid_request", message: parsed.message });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VOICE_TIMEOUT_MS);

  try {
    const response = await fetch(TTS_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: parsed.spokenText,
        voice_id: ttsVoice(),
        language: "en",
      }),
    });

    if (!response.ok) {
      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
      const reason = classifyHttpFailure(response.status, payload);
      return jsonError(
        new ProviderRequestError(
          reason,
          publicMessage(reason),
          response.status,
          `${reason}:http_${response.status}`,
        ),
      );
    }

    const audio = await response.arrayBuffer();
    if (audio.byteLength === 0) {
      return jsonError(
        new ProviderRequestError(
          "validation_failed",
          publicMessage("validation_failed"),
          response.status,
          "validation_failed:empty_audio",
        ),
      );
    }

    const contentType = response.headers.get("content-type") || "audio/mpeg";
    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return jsonError(
        new ProviderRequestError("timeout", publicMessage("timeout"), null, "timeout"),
      );
    }
    return jsonError(
      new ProviderRequestError(
        "unavailable",
        publicMessage("unavailable"),
        null,
        "unavailable:network",
      ),
    );
  } finally {
    clearTimeout(timer);
  }
}
