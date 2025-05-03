import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/middleware/verifyToken";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    const user = await verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchUrl = `https://www.jiosaavn.com/api.php?__call=content.getAlbums&api_version=4&_format=json&_marker=0&n=50&p=1&ctx=wap6dot0`;

    const searchResponse = await fetch(searchUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://www.jiosaavn.com/",
          "Accept": "application/json"
        }
      });
      

    if (!searchResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch search results" },
        { status: searchResponse.status }
      );
    }

    const data = await searchResponse.json();
    console.log(data)

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
