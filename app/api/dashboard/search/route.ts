import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/middleware/verifyToken";

export async function POST(request: Request) {
  try {
    const user = await verifyToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const query = body.query;
    console.log("Query:", query);

    if (!query) {
      return NextResponse.json({ error: "Query missing" }, { status: 400 });
    }

    const response = await fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}`);

    const data = await response.json();
   

    return NextResponse.json({ data }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}
