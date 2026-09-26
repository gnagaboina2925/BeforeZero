import { fetchAlertsForPoint } from "@/lib/nws/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a confirmed location." }, { status: 400 });
  }
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const latitude = typeof record.latitude === "number" ? record.latitude : Number(record.latitude);
  const longitude = typeof record.longitude === "number" ? record.longitude : Number(record.longitude);
  const label = typeof record.label === "string" ? record.label : "Selected location";
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ error: "Confirm a geocoded location first." }, { status: 400 });
  }
  const result = await fetchAlertsForPoint(latitude, longitude, label);
  return NextResponse.json(result);
}
