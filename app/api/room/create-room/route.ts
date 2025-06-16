import { NextResponse } from "next/server";
import { createRoom } from "@/lib/db/room";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, host } = body;

    // Validate input
    if (!name || !code) {
      return NextResponse.json({ error: "Room name and code are required" }, { status: 400 });
    }

    const room = await createRoom(code, name, host);

    // Return the created room as a response
    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}