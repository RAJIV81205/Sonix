import { NextResponse } from "next/server";
import { deleteRoom } from "@/lib/db/room";

export async function DELETE(request: Request) {
    try {
        const { roomCode } = await request.json();
    
        if (!roomCode) {
        return NextResponse.json({ error: "Room code is required" }, { status: 400 });
        }
    
        const result = await deleteRoom(roomCode);
    
        if (!result) {
        return NextResponse.json({ error: "Room not found or already deleted" }, { status: 404 });
        }
    
        return NextResponse.json({ message: "Room deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting room:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
    }