import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const client = await clientPromise;
    const db = client.db("your-database-name");

    const { email, password, username } = req.body;

    const result = await db.collection("users").insertOne({
      email,
      password,
      username,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "User created successfully!", userId: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
}
