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
      console.log("⚠️ [DEBUG] Query missing");
      return NextResponse.json({ error: "Query missing" }, { status: 400 });
    }
    
    const searchUrl = `https://www.jiosaavn.com/api.php?p=1&q=${encodeURIComponent(query)}&_format=json&_marker=0&api_version=4&ctx=wap6dot0&n=20&__call=search.getResults`;
    console.log("🌐 [DEBUG] Fetching search URL:", searchUrl);
    
    const customHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Referer": "https://www.jiosaavn.com/",
      "Accept": "application/json",
      "Cookie": "geo=49.37.81.164%2CIN%2CWest%20Bengal%2CAsansol%2C713325; mm_latlong=23.6833%2C86.9833; B=fdcb22cd0ab1647a9432f45ca844268a; CT=OTU1NTUwNTYz; CH=G03%2CA07%2CO00%2CL03; _pl=wap6dot0-; DL=english"
    };
    
    const searchResponse = await fetch(searchUrl, {
      method: "GET",
      headers: customHeaders,
    });
    
    if (!searchResponse.ok) {
      console.log("❌ [DEBUG] Search failed:", await searchResponse.text());
      return NextResponse.json(
        { error: "Failed to fetch search results" },
        { status: searchResponse.status }
      );
    }
    
    const jsonData = await searchResponse.json();
    console.log("📦 [DEBUG] Raw Search Response:", JSON.stringify(jsonData).slice(0, 300), "...");
    
    const songs = jsonData.results || [];
    console.log(`🎶 [DEBUG] Found ${songs.length} songs`);
    
    // Return search results without fetching download URLs
    return NextResponse.json({ songs }, { status: 200 });
    
  } catch (error: any) {
    console.error("🔥 [DEBUG] Server error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}