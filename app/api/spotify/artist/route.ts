import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/middleware/verifyToken";

const generateSpotifyToken = async () => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Spotify credentials not configured");
    }

    const tokenRequestBody = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
    });

    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: tokenRequestBody.toString()
    });

    if (!tokenResponse.ok) {
        throw new Error(`Failed to get Spotify token: ${tokenResponse.status}`);
    }

    const data = await tokenResponse.json();
    return data.access_token;
};

const fetchArtistData = async (artistId: string, token: string) => {
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Artist not found");
        }
        throw new Error(`Failed to fetch artist data: ${response.status}`);
    }

    return await response.json();
}

const fetchArtistTopTracks = async (artistId: string, token: string) => {
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch top tracks: ${response.status}`);
    }

    return await response.json();
}

export async function POST(request: Request) {
    try {
        // Parse request body
        const body = await request.json();
        const { artistId } = body;

        if (!artistId) {
            return NextResponse.json({ error: "Artist ID is required" }, { status: 400 });
        }

        // Verify authorization token
        const token = request.headers.get("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return NextResponse.json({ error: "Authorization token required" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Get Spotify data
        const spotifyToken = await generateSpotifyToken();
        const [artistData, topTracksData] = await Promise.all([
            fetchArtistData(artistId, spotifyToken),
            fetchArtistTopTracks(artistId, spotifyToken)
        ]);

        return NextResponse.json({
            artist: artistData,
            topTracks: topTracksData.tracks
        });

    } catch (error: any) {
        console.error("API Error:", error.message);
        
        if (error.message.includes("credentials not configured")) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }
        
        if (error.message.includes("Artist not found")) {
            return NextResponse.json({ error: "Artist not found" }, { status: 404 });
        }

        if (error.message.includes("Invalid JSON")) {
            return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
        }

        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}