import { NextResponse } from "next/server";
import { createRoom } from "@/lib/db/room";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code , host } = body;

    // Validate input
    if (!name || !code) {
      return NextResponse.json({ error: "Room name and type are required" }, { status: 400 });
    }

    // Simulate room creation logic
    const newRoom = {
      id: Date.now(), // Simple unique ID based on timestamp
      name: name,
      code: code,
      createdAt: new Date().toISOString(),
    };

    // Return the created room as a response
    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}