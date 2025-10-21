import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/middleware/verifyToken";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    const user = await verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const id = body.id;
    
    if (!id) {
      return NextResponse.json({ error: "Encrypted URL missing" }, { status: 400 });
    }
    
   
    const response =  await fetch (`https://saavn.sumit.co/api/songs/${id}`);

    const data = await response.json();
    
    
    return NextResponse.json({ data :data.data }, { status: 200 });
    
  } catch (error: any) {
    console.error(error)
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}