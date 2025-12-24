import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/middleware/verifyToken";

import { useFetch } from '@/lib/utils/fetch'
import { createSongPayload } from '@/lib/utils/song-transformer'
import { SongAPIResponseModel } from '@/types/song'
import { Endpoints } from '@/lib/saavn/endpoint'

export async function POST(request: Request) {
  try {
    // 1. Auth
    const token = request.headers.get("authorization")?.split(" ")[1];
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Body validation
    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json(
        { error: "Encrypted URL missing" },
        { status: 400 }
      );
    }

    // 3. Fetch song data (logic taken from second route)
    const { data, ok } = await useFetch<any>({
      endpoint: Endpoints.songs.id,
      params: { pids: id }
    });

    if (!ok || !data) {
      return NextResponse.json(
        { error: "Failed to fetch song data" },
        { status: 500 }
      );
    }

    // 4. Normalize JioSaavn response
    let songData = null;

    if (data.songs && Array.isArray(data.songs) && data.songs.length > 0) {
      songData = data.songs[0];
    } else if (data.id) {
      songData = data;
    }

    if (!songData || !songData.id) {
      return NextResponse.json(
        { error: "Song not found" },
        { status: 404 }
      );
    }

    // 5. Validate + transform
    const validatedSong = SongAPIResponseModel.parse(songData);
    const transformedSong = createSongPayload(validatedSong);

    /**
     * IMPORTANT:
     * We wrap it exactly how your first route expects:
     * { data: data.data }
     */
    return NextResponse.json(
      {
        data: [transformedSong]
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
