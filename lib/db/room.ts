import { roomsTable } from "./schema";
import { db } from ".";
import { eq } from "drizzle-orm";

export async function createRoom(roomCode: string, roomName: string, hostId: number) {
    const room = await db.insert(roomsTable).values({
        roomCode,
        roomName,
        hostId,
        createdAt: new Date().toLocaleString(),
    }).returning();
}
