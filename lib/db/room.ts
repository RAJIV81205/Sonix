import { roomsTable } from "./schema";
import { db } from ".";
import { eq } from "drizzle-orm";

// ✅ 1. CREATE ROOM
export async function createRoom(
  roomCode: string,
  roomName: string,
  hostId: number,
  hostname: string
) {
  const room = await db.insert(roomsTable).values({
    roomCode,
    roomName,
    hostId,
    createdAt: new Date().toLocaleString(),
    participants: [{ id: hostId, name: hostname, role: "host" as const }],
  }).returning();

  return room[0]; // Return a single object instead of array
}


export async function getRoomById(roomId: string) {
    const room = await db.select().from(roomsTable).where(eq(roomsTable.roomCode, roomId)).limit(1);
    return room[0];
}

// ✅ 3. JOIN ROOM
export async function joinRoom(
  roomCode: string,
  userId: number,
  userName: string
) {
  const existingRoom = await getRoomById(roomCode);
  if (!existingRoom) {
    throw new Error("Room not found");
  }

  const currentParticipants = existingRoom.participants || [];

  if (currentParticipants.some(p => p.id === userId)) {
    return existingRoom; // User already in the room, return existing room
  }

  const newParticipant = {
    id: userId,
    name: userName,
    role: "participant" as const,
  };

  const updatedParticipants = [...currentParticipants, newParticipant];

  const updatedRoom = await db
    .update(roomsTable)
    .set({ participants: updatedParticipants })
    .where(eq(roomsTable.roomCode, roomCode))
    .returning();

  return updatedRoom[0];
}


export async function deleteRoom(roomCode: string) {
  const room = await getRoomById(roomCode);
  if (!room) {
    throw new Error("Room not found");
  }

  await db.delete(roomsTable).where(eq(roomsTable.roomCode, roomCode));
  return { message: "Room deleted successfully" };
}