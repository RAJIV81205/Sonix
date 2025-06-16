import { NextResponse } from "next/server";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomName, roomType } = body;

    // Validate input
    if (!roomName || !roomType) {
      return NextResponse.json({ error: "Room name and type are required" }, { status: 400 });
    }

    // Simulate room creation logic
    const newRoom = {
      id: Date.now(), // Simple unique ID based on timestamp
      name: roomName,
      type: roomType,
      createdAt: new Date().toISOString(),
    };

    // Return the created room as a response
    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}