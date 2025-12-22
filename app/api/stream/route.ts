// app/api/stream/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const audioUrl = new URL(req.url).searchParams.get("url");
  if (!audioUrl) {
    return new NextResponse("Missing url", { status: 400 });
  }

  const upstream = await fetch(audioUrl);

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Disposition": "inline",
      "Accept-Ranges": "bytes",
    },
  });
}
