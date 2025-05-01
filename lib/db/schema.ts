import { integer, pgTable, varchar  } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  username: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  createdAt: varchar().notNull(),
});


export const songsTable = pgTable("songs", {
  id: varchar({ length: 255 }).primaryKey(),
  name: varchar().notNull(),
  artist: varchar().notNull(),
  image: varchar().notNull(),
  url: varchar().notNull(),
  createdAt: varchar().notNull(),
})