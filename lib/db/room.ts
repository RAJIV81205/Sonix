import { roomsTable } from "./schema";
import { db } from ".";
import { eq } from "drizzle-orm";

export async function createRoom(roomCode: string, roomName: string, hostId: number) {
    const room = await db.insert(roomsTable).values({
        roomCode,
        roomName,
        hostId,
        createdAt: new Date().toISOString(), // Use ISO string for consistency
    }).returning();
    return room;
}

export async function getRoomById(roomId: string) {
    const room = await db.select().from(roomsTable).where(eq(roomsTable.roomCode, roomId)).limit(1);
    return room[0];
}

export async function joinRoom(roomCode: string, userId: number, userName: string) {
    // Check if the room exists
    const existingRoom = await getRoomById(roomCode);
    if (!existingRoom) {
        throw new Error("Room not found");
    }

    // Initialize participants array if it doesn't exist
    const currentParticipants = existingRoom.participants || [];
    
    // Check if the user is already a participant
    if (currentParticipants.some(participant => participant.id === userId)) {
        throw new Error("User already in the room");
    }

    // Create new participant object
    const newParticipant = { id: userId, name: userName };
    
    // Add the new participant to the existing participants
    const updatedParticipants = [...currentParticipants, newParticipant];

    // Update the room in the database
    const room = await db.update(roomsTable)
        .set({
            participants: updatedParticipants,
        })
        .where(eq(roomsTable.roomCode, roomCode))
        .returning();
        
    return room[0];
}