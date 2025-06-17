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
    return room;
}


export async function getRoomById(roomId: string) {
    const room = await db.select().from(roomsTable).where(eq(roomsTable.id, roomId)).limit(1);
    return room[0];
}
