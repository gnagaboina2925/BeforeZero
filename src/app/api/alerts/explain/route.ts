import { explainOfficialAlert, parseExplainRequest } from "@/lib/nws/explain";
import { publicInterpretError, ProviderRequestError } from "@/lib/xai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: publicInterpretError("invalid_request", "Send the selected alert.") },
      { status: 400 },
    );
  }
  const parsed = parseExplainRequest(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: publicInterpretError("invalid_request", parsed.message) }, { status: 400 });
  }
  try {
    const result = await explainOfficialAlert(parsed.alert, { apiKey: process.env.XAI_API_KEY });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ProviderRequestError) {
      return NextResponse.json(
        { error: publicInterpretError(error.code, error.message, error.diagnostic) },
        { status: error.code === "missing_credentials" ? 503 : 502 },
      );
    }
    return NextResponse.json(
      { error: publicInterpretError("unavailable", "Explanation is unavailable right now.") },
      { status: 503 },
    );
  }
}
