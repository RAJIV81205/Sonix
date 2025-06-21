import { NextResponse } from "next/server";
import { joinRoom } from "@/lib/db/room";
import { verify } from "jsonwebtoken";
import { findUserByEmail } from "@/lib/db/auth";

export async function POST(request: Request) {
    const token = request.headers.get("Authorization");
    const { roomCode } = await request.json();
    
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user;
    
    // Verify the JWT token
    try {
        const decoded = verify(token.split(" ")[1], process.env.JWT_SECRET as string);
        if (!decoded) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const userEmail = (decoded as { email: string }).email;
        if (!userEmail) {
            return NextResponse.json({ error: "Invalid token payload" }, { status: 400 });
        }
        
        user = await findUserByEmail(userEmail);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
    } catch (error) {
        console.error("Token verification failed:", error);
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    try {
        // Validate input
        if (!roomCode || !user.id || !user.name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Attempt to join the room
        const room = await joinRoom(roomCode, user.id, user.name);

        return NextResponse.json(room);
    } catch (error) {
        console.error("Error joining room:", error);
        return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
    }
}