import { geocodeQuery } from "@/lib/nws/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON object with a query." }, { status: 400 });
  }
  const query = body && typeof body === "object" ? (body as { query?: unknown }).query : null;
  if (typeof query !== "string") {
    return NextResponse.json({ error: "Enter a U.S. city and state, or a ZIP code." }, { status: 400 });
  }
  const result = await geocodeQuery(query);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 422 });
  }
  return NextResponse.json({ candidates: result.candidates });
}
