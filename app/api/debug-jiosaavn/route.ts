import { NextResponse } from "next/server";

export const config = {
  runtime: 'edge',
};

export async function POST(request: Request) {
  try {
    console.log("🔍 [DEBUG] API route hit: /api/debug-jiosaavn");
    
    const body = await request.json();
    const query = body.query;
    
    if (!query) {
      return NextResponse.json({ error: "Query missing" }, { status: 400 });
    }
    
    const searchUrl = `https://www.jiosaavn.com/api.php?p=1&q=${encodeURIComponent(query)}&_format=json&_marker=0&api_version=4&ctx=wap6dot0&n=20&__call=search.getResults`;
    
    // Log environment information
    console.log("🌐 [DEBUG] Environment:", {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_REGION: process.env.VERCEL_REGION,
      VERCEL_ENV: process.env.VERCEL_ENV
    });
    
    // Create browser-like headers
    const customHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Referer": "https://www.jiosaavn.com/",
      "Origin": "https://www.jiosaavn.com",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "sec-ch-ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-User": "?1",
      "Sec-Fetch-Dest": "document",
      "Cookie": "DL=english; L=english; CT=IN; geo_country=IN; _pl=wap6dot0-"
    };
    
    console.log("📋 [DEBUG] Request Headers:", customHeaders);
    
    // Use a custom AbortController to implement timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const searchResponse = await fetch(searchUrl, {
        method: "GET",
        headers: customHeaders,
        cache: "no-store",
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Log the response details
      console.log("📑 [DEBUG] Response Status:", searchResponse.status);
      console.log("📑 [DEBUG] Response Headers:", Object.fromEntries(searchResponse.headers));
      
      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.log("❌ [DEBUG] Fetch failed:", errorText);
        return NextResponse.json(
          { error: "Failed to fetch search results", details: errorText },
          { status: searchResponse.status }
        );
      }
      
      const jsonData = await searchResponse.json();
      
      // Log basic response info
      console.log("📄 [DEBUG] Response Type:", typeof jsonData);
      console.log("🔢 [DEBUG] Results Count:", (jsonData.results || []).length);
      
      // Return only the necessary data and full diagnostics
      return NextResponse.json({
        success: true,
        results: jsonData.results || [],
        diagnostics: {
          url: searchUrl,
          responseStatus: searchResponse.status,
          responseSize: JSON.stringify(jsonData).length,
          resultsCount: (jsonData.results || []).length,
          environment: {
            NODE_ENV: process.env.NODE_ENV,
            VERCEL_REGION: process.env.VERCEL_REGION,
            VERCEL_ENV: process.env.VERCEL_ENV
          }
        }
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error("🔥 [DEBUG] Fetch error:", fetchError);
      return NextResponse.json(
        { error: "Fetch error", details: fetchError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("🔥 [DEBUG] Server error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}