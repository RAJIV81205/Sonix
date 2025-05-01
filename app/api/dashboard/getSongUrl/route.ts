import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/middleware/verifyToken";

export async function POST(request: Request) {
  try {
    console.log("🔍 [DEBUG] API route hit: /api/dashboard/getSongUrl");
    
    const user = await verifyToken(request);
    console.log("🧾 [DEBUG] Decoded User:", user);
    
    if (!user) {
      console.log("🚫 [DEBUG] Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    console.log("📨 [DEBUG] Request Body:", body);
    
    const encryptedUrl = body.encryptedUrl;
    if (!encryptedUrl) {
      console.log("⚠️ [DEBUG] Encrypted URL missing");
      return NextResponse.json({ error: "Encrypted URL missing" }, { status: 400 });
    }
    
    const customHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Referer": "https://www.jiosaavn.com/",
      "Accept": "application/json",
      "Cookie": "geo=49.37.81.164%2CIN%2CWest%20Bengal%2CAsansol%2C713325; mm_latlong=23.6833%2C86.9833; B=fdcb22cd0ab1647a9432f45ca844268a; CT=OTU1NTUwNTYz; CH=G03%2CA07%2CO00%2CL03; _pl=wap6dot0-; DL=english"
    };
    
    // Handle '+' characters correctly in the URL
    const encodedUrl = encryptedUrl.replace(/\+/g, "%2B");
    const tokenUrl = `https://www.jiosaavn.com/api.php?__call=song.generateAuthToken&url=${encodedUrl}&bitrate=64&api_version=4&_format=json&ctx=wap6dot0&_marker=0`;
    
    console.log(`🔑 [DEBUG] Fetching token URL:`, tokenUrl);
    
    const tokenResponse = await fetch(tokenUrl, {
      method: "GET",
      headers: customHeaders,
    });
    
    if (!tokenResponse.ok) {
      console.log("❌ [DEBUG] Token fetch failed:", await tokenResponse.text());
      return NextResponse.json(
        { error: "Failed to generate auth token" },
        { status: tokenResponse.status }
      );
    }
    
    const tokenData = await tokenResponse.json();
    const originalUrl = tokenData?.auth_url || null;
    
    if (!originalUrl) {
      console.log("❌ [DEBUG] No auth URL returned");
      return NextResponse.json(
        { error: "No download URL available" },
        { status: 404 }
      );
    }
    
    // Replace 'c.cf' with 'ac' for better CDN
    const finalUrl = originalUrl.replace("c.cf", "ac");
    console.log(`✅ [DEBUG] Song download URL:`, finalUrl);
    
    return NextResponse.json({ downloadUrl: finalUrl }, { status: 200 });
    
  } catch (error: any) {
    console.error("🔥 [DEBUG] Server error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}