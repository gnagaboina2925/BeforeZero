import { InterpretInputError } from "@/lib/interpretAnswer";
import { interpretSimulationUtterance } from "@/lib/simulation/interpretAction";
import { logInterpretDiagnostic, publicMessage } from "@/lib/diagnostics";
import { getConfiguredModel, ProviderRequestError, publicInterpretError } from "@/lib/xai";
import { NextResponse } from "next/server";

function statusForCode(code: ProviderRequestError["code"]): number {
  switch (code) {
    case "invalid_request":
    case "invalid_schema":
      return 502;
    case "auth_failed":
      return 401;
    case "insufficient_credits":
      return 402;
    case "rate_limited":
      return 429;
    case "timeout":
      return 504;
    case "unavailable_model":
      return 404;
    case "validation_failed":
      return 502;
    default:
      return 503;
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: publicInterpretError(
          "invalid_request",
          "Send a JSON object with your action.",
          "invalid_request:json",
        ),
      },
      { status: 400 },
    );
  }

  try {
    const result = await interpretSimulationUtterance(body, {
      apiKey: process.env.XAI_API_KEY,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof InterpretInputError) {
      return NextResponse.json(
        {
          error: publicInterpretError("invalid_request", error.message, "invalid_request"),
        },
        { status: 400 },
      );
    }
    if (error instanceof ProviderRequestError) {
      return NextResponse.json(
        {
          error: publicInterpretError(error.code, error.message, error.diagnostic),
        },
        { status: statusForCode(error.code) },
      );
    }
    logInterpretDiagnostic({
      event: "beforezero-interpret",
      hasApiKey: Boolean(process.env.XAI_API_KEY?.trim()),
      model: getConfiguredModel(),
      httpStatus: null,
      reason: "unavailable",
      finishReason: null,
      hasMessageContent: false,
      hasRefusal: false,
      jsonParsed: false,
      providerCodeToken: null,
    });
    return NextResponse.json(
      {
        error: publicInterpretError(
          "unavailable",
          publicMessage("unavailable"),
          "unavailable:unhandled",
        ),
      },
      { status: 503 },
    );
  }
}
