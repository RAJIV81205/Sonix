import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/middleware/verifyToken";
import { addSong, addSongToPlaylist } from "@/lib/db/song";
import { db } from "@/lib/db";
import { playlistSongsTable } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

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

    // Parse request body
    const body = await request.json();
    const { playlistId, song } = body;

    if (!playlistId || typeof playlistId !== "string") {
      return NextResponse.json(
        { message: "Bad request: Playlist ID is required" },
        { status: 400 }
      );
    }

    if (!song || !song.id || !song.name || !song.artist || !song.image || !song.url) {
      return NextResponse.json(
        { message: "Bad request: Song data is incomplete" },
        { status: 400 }
      );
    }

    // First, add or get the song in the database
    const savedSong = await addSong(
      song.id,
      song.name,
      song.artist,
      song.image,
      song.url,
      song.duration
    );

    // Check if the song is already in the playlist
    const existingEntry = await db
      .select()
      .from(playlistSongsTable)
      .where(
        and(
          eq(playlistSongsTable.playlistId, playlistId),
          eq(playlistSongsTable.songId, savedSong.id)
        )
      );

    // If song already exists in playlist, return a friendly message
    if (existingEntry.length > 0) {
      return NextResponse.json(
        {
          message: "Song already exists in this playlist",
          song: savedSong,
          alreadyExists: true
        },
        { status: 200 }
      );
    }

    // If song doesn't exist in playlist, add it
    const playlistSong = await addSongToPlaylist(playlistId, savedSong.id);

    // Return success response
    return NextResponse.json(
      {
        message: "Song added to playlist successfully",
        song: savedSong,
        playlistSong
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 