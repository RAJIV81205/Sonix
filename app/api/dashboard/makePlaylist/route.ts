import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/middleware/verifyToken";
import { createPlaylist } from "@/lib/db/song";

export async function POST(request: NextRequest) {
  try {
    // Verify token and get userId
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized: Missing token" },
        { status: 401 }
      );
    }
    
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }
    
    const userId = decoded.userId;
    
    // Parse request body
    const body = await request.json();
    const { name, cover } = body;
    
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { message: "Bad request: Playlist name is required" },
        { status: 400 }
      );
    }
    
    // Create playlist in the database
    // If cover is provided, pass it to the createPlaylist function
    const playlist = cover 
      ? await createPlaylist(name.trim(), userId, cover)
      : await createPlaylist(name.trim(), userId);
    
    // Return success response
    return NextResponse.json(
      {
        message: "Playlist created successfully",
        playlist: {
          id: playlist.id,
          name: playlist.name,
          userId: playlist.userId,
          cover: playlist.cover || null,
          createdAt: playlist.createdAt
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating playlist:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}