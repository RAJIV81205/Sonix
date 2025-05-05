import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/middleware/verifyToken";
import { db } from "@/lib/db";
import { playlistsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSongsInPlaylist } from "@/lib/db/song";

export async function POST(request: Request) {
    try {
        const token = request.headers.get("authorization")?.split(" ")[1];
        const body = await request.json();
        const { playlistId } = body;

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

        if (!playlistId) {
            return NextResponse.json(
                { message: "Bad request: Playlist ID is required" },
                { status: 400 }
            );
        }

        // Get playlist details
        const playlists = await db
            .select()
            .from(playlistsTable)
            .where(eq(playlistsTable.id, playlistId));

        if (playlists.length === 0) {
            return NextResponse.json(
                { message: "Playlist not found" },
                { status: 404 }
            );
        }

        const playlist = playlists[0];

        // Verify ownership (optional, depending on your app's requirements)
        if (playlist.userId !== userId) {
            return NextResponse.json(
                { message: "Unauthorized: You don't have access to this playlist" },
                { status: 403 }
            );
        }

        // Get all songs in the playlist
        const songs = await getSongsInPlaylist(playlistId);

        return NextResponse.json({
            message: "Playlist retrieved successfully",
            playlist: {
                id: playlist.id,
                name: playlist.name,
                createdAt: playlist.createdAt,
                cover: playlist.cover,
                songs

            }
        });
    } catch (error) {
        console.error("Error retrieving playlist:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}