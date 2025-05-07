import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/middleware/verifyToken";
import { db } from "@/lib/db";
import { playlistsTable, playlistSongsTable } from "@/lib/db/schema";
import { eq, count, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
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

    // Fetch playlists with song count
    const playlists = await db
      .select({
        id: playlistsTable.id,
        name: playlistsTable.name,
        createdAt: playlistsTable.createdAt,
        songCount: count(playlistSongsTable.songId).as("songCount"),
        cover : playlistsTable.cover,
      })
      .from(playlistsTable)
      .leftJoin(
        playlistSongsTable,
        eq(playlistsTable.id, playlistSongsTable.playlistId)
      )
      .where(eq(playlistsTable.userId, userId))
      .groupBy(playlistsTable.id)
      .orderBy(sql`${playlistsTable.createdAt} DESC`);

    return NextResponse.json({
      message: "Playlists retrieved successfully",
      playlists,
    });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 