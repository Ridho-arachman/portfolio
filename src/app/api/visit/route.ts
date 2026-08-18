import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface VisitPayload {
  path: string;
  timezone?: string;
  language?: string;
  sessionId?: string;
}

const TIMEZONE_COUNTRY: Record<string, { country: string; code: string; region: string; city?: string; lat?: number; lng?: number }> = {
  "Asia/Jakarta":       { country: "Indonesia", code: "id", region: "Southeast Asia", city: "Jakarta", lat: -6.2, lng: 106.845 },
  "Asia/Makassar":      { country: "Indonesia", code: "id", region: "Southeast Asia", city: "Makassar", lat: -5.14, lng: 119.42 },
  "Asia/Jayapura":      { country: "Indonesia", code: "id", region: "Southeast Asia", city: "Jayapura", lat: -2.53, lng: 140.72 },
  "Asia/Shanghai":      { country: "China", code: "cn", region: "East Asia", city: "Shanghai", lat: 31.23, lng: 121.47 },
  "Asia/Chongqing":     { country: "China", code: "cn", region: "East Asia", city: "Chongqing", lat: 29.43, lng: 106.91 },
  "Asia/Tokyo":         { country: "Japan", code: "jp", region: "East Asia", city: "Tokyo", lat: 35.68, lng: 139.69 },
  "Asia/Seoul":         { country: "South Korea", code: "kr", region: "East Asia", city: "Seoul", lat: 37.57, lng: 126.98 },
  "Asia/Kolkata":       { country: "India", code: "in", region: "South Asia", city: "Mumbai", lat: 19.08, lng: 72.88 },
  "Asia/Calcutta":      { country: "India", code: "in", region: "South Asia", city: "Kolkata", lat: 22.57, lng: 88.36 },
  "Asia/Dubai":         { country: "UAE", code: "ae", region: "Middle East", city: "Dubai", lat: 25.2, lng: 55.27 },
  "Asia/Singapore":     { country: "Singapore", code: "sg", region: "Southeast Asia", city: "Singapore", lat: 1.35, lng: 103.82 },
  "Asia/Bangkok":       { country: "Thailand", code: "th", region: "Southeast Asia", city: "Bangkok", lat: 13.76, lng: 100.5 },
  "Asia/Ho_Chi_Minh":   { country: "Vietnam", code: "vn", region: "Southeast Asia", city: "Ho Chi Minh City", lat: 10.82, lng: 106.63 },
  "Asia/Kuala_Lumpur":  { country: "Malaysia", code: "my", region: "Southeast Asia", city: "Kuala Lumpur", lat: 3.14, lng: 101.69 },
  "Asia/Manila":        { country: "Philippines", code: "ph", region: "Southeast Asia", city: "Manila", lat: 14.6, lng: 120.98 },
  "Europe/London":      { country: "United Kingdom", code: "gb", region: "Europe", city: "London", lat: 51.51, lng: -0.13 },
  "Europe/Paris":       { country: "France", code: "fr", region: "Europe", city: "Paris", lat: 48.86, lng: 2.35 },
  "Europe/Berlin":      { country: "Germany", code: "de", region: "Europe", city: "Berlin", lat: 52.52, lng: 13.41 },
  "Europe/Amsterdam":   { country: "Netherlands", code: "nl", region: "Europe", city: "Amsterdam", lat: 52.37, lng: 4.9 },
  "Europe/Madrid":      { country: "Spain", code: "es", region: "Europe", city: "Madrid", lat: 40.42, lng: -3.7 },
  "Europe/Rome":        { country: "Italy", code: "it", region: "Europe", city: "Rome", lat: 41.9, lng: 12.5 },
  "Europe/Moscow":      { country: "Russia", code: "ru", region: "Europe", city: "Moscow", lat: 55.76, lng: 37.62 },
  "Europe/Istanbul":    { country: "Turkey", code: "tr", region: "Europe", city: "Istanbul", lat: 41.01, lng: 28.98 },
  "America/New_York":   { country: "United States", code: "us", region: "Americas", city: "New York", lat: 40.71, lng: -74.01 },
  "America/Chicago":    { country: "United States", code: "us", region: "Americas", city: "Chicago", lat: 41.88, lng: -87.63 },
  "America/Denver":     { country: "United States", code: "us", region: "Americas", city: "Denver", lat: 39.74, lng: -104.99 },
  "America/Los_Angeles":{ country: "United States", code: "us", region: "Americas", city: "Los Angeles", lat: 34.05, lng: -118.24 },
  "America/Sao_Paulo":  { country: "Brazil", code: "br", region: "Americas", city: "São Paulo", lat: -23.55, lng: -46.63 },
  "America/Mexico_City":{ country: "Mexico", code: "mx", region: "Americas", city: "Mexico City", lat: 19.43, lng: -99.13 },
  "America/Toronto":    { country: "Canada", code: "ca", region: "Americas", city: "Toronto", lat: 43.65, lng: -79.38 },
  "America/Vancouver":  { country: "Canada", code: "ca", region: "Americas", city: "Vancouver", lat: 49.28, lng: -123.12 },
  "Australia/Sydney":   { country: "Australia", code: "au", region: "Oceania", city: "Sydney", lat: -33.87, lng: 151.21 },
  "Australia/Melbourne":{ country: "Australia", code: "au", region: "Oceania", city: "Melbourne", lat: -37.81, lng: 144.96 },
  "Pacific/Auckland":   { country: "New Zealand", code: "nz", region: "Oceania", city: "Auckland", lat: -36.85, lng: 174.76 },
  "Africa/Cairo":       { country: "Egypt", code: "eg", region: "Africa", city: "Cairo", lat: 30.04, lng: 31.24 },
  "Africa/Lagos":       { country: "Nigeria", code: "ng", region: "Africa", city: "Lagos", lat: 6.52, lng: 3.38 },
  "Asia/Riyadh":        { country: "Saudi Arabia", code: "sa", region: "Middle East", city: "Riyadh", lat: 24.71, lng: 46.68 },
  "Asia/Taipei":        { country: "Taiwan", code: "tw", region: "East Asia", city: "Taipei", lat: 25.03, lng: 121.57 },
  "Asia/Hong_Kong":     { country: "Hong Kong", code: "hk", region: "East Asia", city: "Hong Kong", lat: 22.32, lng: 114.17 },
};

function resolveLocation(timezone?: string): { country: string; code: string; region: string; city?: string; lat?: number; lng?: number } {
  if (timezone && TIMEZONE_COUNTRY[timezone]) {
    return TIMEZONE_COUNTRY[timezone];
  }
  return { country: "Others", code: "oth", region: "Others" };
}

export async function POST(request: Request) {
  try {
    const body: VisitPayload = await request.json();
    const { path, timezone, sessionId } = body;

    if (!path) {
      return NextResponse.json({ error: "path is required" }, { status: 400 });
    }

    const location = resolveLocation(timezone);
    const userAgent = request.headers.get("user-agent")?.slice(0, 500) || null;

    const visit = await prisma.visit.create({
      data: {
        path,
        country: location.country,
        countryCode: location.code,
        region: location.region,
        city: location.city ?? null,
        lat: location.lat ?? null,
        lng: location.lng ?? null,
        userAgent,
        sessionId: sessionId ?? null,
      },
    });

    return NextResponse.json({ id: visit.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to record visit" }, { status: 500 });
  }
}
