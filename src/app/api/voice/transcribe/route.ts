import { apiKeyPresent, classifyHttpFailure, publicMessage } from "@/lib/diagnostics";
import {
  ProviderRequestError,
  publicInterpretError,
} from "@/lib/xai";
import {
  filenameForAudioType,
  readTranscriptText,
  STT_URL,
  sttModel,
  validateVoiceUpload,
  VOICE_TIMEOUT_MS,
} from "@/lib/voice";
import { NextResponse } from "next/server";

function errorResponse(error: ProviderRequestError | { code: "invalid_request"; message: string }) {
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
    return errorResponse(
      new ProviderRequestError(
        "missing_credentials",
        publicMessage("missing_credentials"),
        null,
        "missing_credentials",
      ),
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse({
      code: "invalid_request",
      message: "Send an audio recording as a file upload.",
    });
  }

  const uploaded = form.get("file");
  if (!(uploaded instanceof File)) {
    return errorResponse({
      code: "invalid_request",
      message: "Send an audio recording as a file upload.",
    });
  }

  const validation = validateVoiceUpload(uploaded);
  if (!validation.ok) {
    return errorResponse({ code: "invalid_request", message: validation.message });
  }

  const outbound = new FormData();
  outbound.append("model", sttModel());
  outbound.append("language", "en");
  outbound.append("format", "true");
  outbound.append(
    "file",
    uploaded,
    uploaded.name || filenameForAudioType(uploaded.type),
  );

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VOICE_TIMEOUT_MS);

  try {
    const response = await fetch(STT_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: outbound,
    });

    if (!response.ok) {
      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
      const reason = classifyHttpFailure(response.status, payload);
      return errorResponse(
        new ProviderRequestError(
          reason,
          publicMessage(reason),
          response.status,
          `${reason}:http_${response.status}`,
        ),
      );
    }

    const payload: unknown = await response.json();
    const transcript = readTranscriptText(payload);
    if (!transcript) {
      return NextResponse.json(
        {
          error: publicInterpretError(
            "validation_failed",
            "No speech was recognized. You can type your answer instead.",
            "validation_failed:empty_transcript",
          ),
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ transcript });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return errorResponse(
        new ProviderRequestError("timeout", publicMessage("timeout"), null, "timeout"),
      );
    }
    return errorResponse(
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
