import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/middleware/verifyToken";

export async function POST(request: Request) {
  try {
  
    const token = request.headers.get("authorization")?.split(" ")[1];
    const user = await verifyToken(token);
    

    if (!user) {
      console.log("🚫 [DEBUG] Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
   

    const query = body.query;
    if (!query) {
      return NextResponse.json({ error: "Query missing" }, { status: 400 });
    }

    const searchUrl = `https://www.jiosaavn.com/api.php?p=1&q=${encodeURIComponent(query)}&_format=json&_marker=0&api_version=4&ctx=wap6dot0&n=20&__call=search.getResults`;
    console.log("🔗 [DEBUG] Request URL:", searchUrl);

    // Headers based on the network panel you shared
    const customHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Referer": "https://www.jiosaavn.com/",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive",
      "Cache-Control": "max-age=0",
      "sec-ch-ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-User": "?1",
      "Sec-Fetch-Dest": "document",
      "Upgrade-Insecure-Requests": "1",
      "Cookie": "DL=english; L=english; CT=IN; geo_country=IN; _pl=wap6dot0-"
    };
    
    console.log("📋 [DEBUG] Request Headers:", customHeaders);

    const searchResponse = await fetch(searchUrl, {
      method: "GET",
      headers: customHeaders,
      next: { revalidate: 0 }, // prevent caching on Vercel Edge
      cache: 'no-store' // Explicitly prevent caching
    });

    if (!searchResponse.ok) {
      console.log("❌ [DEBUG] Fetch failed:", await searchResponse.text());
      console.log("📑 [DEBUG] Response Status:", searchResponse.status);
      console.log("📑 [DEBUG] Response Headers:", Object.fromEntries(searchResponse.headers));
      return NextResponse.json(
        { error: "Failed to fetch search results" },
        { status: searchResponse.status }
      );
    }

    const jsonData = await searchResponse.json();
    console.log("📦 [DEBUG] Raw Response:", JSON.stringify(jsonData).slice(0, 500), "...");
    console.log("📑 [DEBUG] Response Headers:", Object.fromEntries(searchResponse.headers));

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