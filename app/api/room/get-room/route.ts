import {NextResponse} from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');
    
        // Validate input
        if (!roomId) {
        return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
        }
    
        // Fetch the room from the database (this function should be implemented)
        const room = await getRoomById(roomId);
    
        if (!room) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }
    
        // Return the room details as a response
        return NextResponse.json({ room }, { status: 200 });
    } catch (error) {
        console.error("Error fetching room:", error);
        return NextResponse.json({ error: "Failed to fetch room" }, { status: 500 });
    }
    }