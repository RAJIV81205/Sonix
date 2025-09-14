import { NextResponse } from "next/server";
import getChosicToken from "@/lib/middleware/ChosicToken";
import { verifyToken } from "@/lib/middleware/verifyToken";

export async function POST(request: Request) {
    const body = await request.json();
    const id = body.chartId;

    if (!id) {
        return NextResponse.json({ error: "Artist ID is required" }, { status: 400 });
    }

    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
        return NextResponse.json({ error: "Token is required" }, { status: 401 });
    }
    const decoded = await verifyToken(token);
    if (!decoded) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get Spotify data
    const spotifyToken = await getChosicToken();

    try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
            headers: {
                "Authorization": `Bearer ${spotifyToken}`
            }
        })
        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });

    }


}
