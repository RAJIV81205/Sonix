import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/middleware/verifyToken";

export async function POST(request: Request) {
  try {
    console.log("🔍 [DEBUG] API route hit: /api/dashboard/search");

    const user = await verifyToken(request);
    console.log("🧾 [DEBUG] Decoded User:", user);

    if (!user) {
      console.log("🚫 [DEBUG] Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("📨 [DEBUG] Request Body:", body);

    const query = body.query;
    if (!query) {
      return NextResponse.json({ error: "Query missing" }, { status: 400 });
    }

    const searchUrl = `https://www.jiosaavn.com/api.php?p=1&q=${encodeURIComponent(query)}&_format=json&_marker=0&api_version=4&ctx=wap6dot0&n=20&__call=search.getResults`;

    const customHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Referer": "https://www.jiosaavn.com/",
      "Accept": "application/json",
      // Add only minimal cookies to avoid detection/blocking
      "Cookie": "DL=english; _pl=wap6dot0-"
    };

    const searchResponse = await fetch(searchUrl, {
      method: "GET",
      headers: customHeaders,
      next: { revalidate: 0 } // prevent caching on Vercel Edge
    });

    if (!searchResponse.ok) {
      console.log("❌ [DEBUG] Fetch failed:", await searchResponse.text());
      return NextResponse.json(
        { error: "Failed to fetch search results" },
        { status: searchResponse.status }
      );
    }

    const jsonData = await searchResponse.json();
    console.log("📦 [DEBUG] Raw Response:", JSON.stringify(jsonData).slice(0, 500), "...");

    const songs = jsonData.results || [];
    console.log(`🎶 [DEBUG] Found ${songs.length} songs`);

    return NextResponse.json({ songs }, { status: 200 });

  } catch (error: any) {
    console.error("🔥 [DEBUG] Server error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
