import { NextResponse } from "next/server";
import { createRoom } from "@/lib/db/room";
import { findUserByEmail } from "@/lib/db/auth";
import jwt from "jsonwebtoken"; // Corrected import

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization");
    const body = await request.json();
    const { name, code } = body;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET!) as { email: string }; // ✅ Type assertion for email
    const user = await findUserByEmail(decoded.email); // ✅ decoded must have `email`

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Validate input
    if (!name || !code) {
      return NextResponse.json({ error: "Room name and code are required" }, { status: 400 });
    }

    // Use user.id or user.email depending on your DB logic
    const room = await createRoom(code, name, user.id, user.name); // Ensure these match createRoom args

    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
