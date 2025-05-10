import { integer, pgTable, varchar, uuid, primaryKey } from "drizzle-orm/pg-core";

// USERS TABLE
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  username: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  createdAt: varchar().notNull(),
});

// SONGS TABLE
export const songsTable = pgTable("songs", {
  id: varchar({ length: 255 }).primaryKey(), // Use the song ID from API
  name: varchar({ length: 255 }).notNull(),
  artist: varchar({ length: 255 }).notNull(),
  image: varchar({ length: 500 }).notNull(),
  url: varchar({ length: 500 }).notNull(),
  duration: integer().notNull(),
  createdAt: varchar().notNull(),
});

// PLAYLISTS TABLE
export const playlistsTable = pgTable("playlists", {
  id: uuid().primaryKey().defaultRandom(), // or varchar if you want
  userId: integer().notNull(), // FK to usersTable.id
  name: varchar({ length: 255 }).notNull(),
  createdAt: varchar().notNull(),
  cover:varchar()
});

// JOIN TABLE: PLAYLIST <-> SONGS
export const playlistSongsTable = pgTable("playlist_songs", {
  playlistId: uuid().notNull(),
  songId: varchar({ length: 255 }).notNull(),
  addedAt: varchar().notNull().default(new Date().toISOString()),
}, (table) => ({
  pk: primaryKey({ columns: [table.playlistId, table.songId] }),
}));
