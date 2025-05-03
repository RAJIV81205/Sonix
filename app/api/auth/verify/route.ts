import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { findUserByEmail } from "@/lib/db/auth";

// Define the type for the decoded token
interface DecodedToken {
  email: string;
  exp?: number;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ message: "Token not provided" }, { status: 401 });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET as string) as DecodedToken;

    if (!decoded?.email) {
      return NextResponse.json({ message: "Invalid token payload" }, { status: 400 });
    }

    const user = await findUserByEmail(decoded.email);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Token is valid", user });
  } catch (error) {
    return NextResponse.json(
      { message: "Token is invalid or expired", error: (error as Error).message },
      { status: 401 }
    );
  }
}
