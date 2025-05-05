import { db } from ".";
import { eq } from "drizzle-orm";
import { songsTable, playlistsTable, playlistSongsTable } from "./schema";

// ✅ Add a song (if not already present)
export async function addSong(
  id: string,
  name: string,
  artist: string,
  image: string,
  url: string
) {
  const existing = await db
    .select()
    .from(songsTable)
    .where(eq(songsTable.id, id));

  if (existing.length > 0) {
    return existing[0];
  }

  const [song] = await db
    .insert(songsTable)
    .values({
      id,
      name,
      artist,
      image,
      url,
      createdAt: new Date().toISOString(),
    })
    .returning();

  return song;
}

// ✅ Create a playlist for a user
export async function createPlaylist(name: string, userId: number, cover?: string) {
  const [playlist] = await db
    .insert(playlistsTable)
    .values({
      name,
      userId,
      createdAt: new Date().toISOString(),
      cover: cover || null 
    })
    .returning();

  return playlist;
}


// ✅ Add a song to a playlist
export async function addSongToPlaylist(playlistId: string, songId: string) {
  const [entry] = await db
    .insert(playlistSongsTable)
    .values({
      playlistId,
      songId,
      addedAt: new Date().toISOString(),
    })
    .returning();

  return entry;
}

// ✅ (Optional) Get all songs in a playlist
export async function getSongsInPlaylist(playlistId: string) {
  const result = await db
    .select({
      id: songsTable.id,
      name: songsTable.name,
      artist: songsTable.artist,
      image: songsTable.image,
      url: songsTable.url,
    })
    .from(playlistSongsTable)
    .innerJoin(songsTable, eq(playlistSongsTable.songId, songsTable.id))
    .where(eq(playlistSongsTable.playlistId, playlistId));

  return result;
}
