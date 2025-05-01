import { db } from ".";
import { songsTable } from "./schema";


export async function addSong(
    id: string,
    name: string,
    artist: string,
    image: string,
    url: string
) {
    const song = await db
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

    return song[0];
}