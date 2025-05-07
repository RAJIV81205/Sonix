import { NextResponse } from "next/server";
import { addSong, addSongToPlaylist } from "@/lib/db/song";
import { db } from "@/lib/db";
import { playlistSongsTable } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

const getSongDetails = async (song: any) => {
    const query = `${song.track.name.split('(')[0]} - ${song.track.artists[0].name}`;

    try {
        const searchUrl = `https://www.jiosaavn.com/api.php?p=1&q=${encodeURIComponent(query)}&_format=json&_marker=0&api_version=4&ctx=wap6dot0&n=20&__call=search.getResults`;

        const customHeaders = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Referer": `https://www.jiosaavn.com/search/song/${encodeURIComponent(query)}`,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Cache-Control": "max-age=0",
            "sec-ch-ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-User": "?1",
            "Sec-Fetch-Dest": "document",
            "Upgrade-Insecure-Requests": "1",
            "Cookie": "DL=english; L=english; CT=IN; geo_country=IN; _pl=wap6dot0-"
        };

        const searchResponse = await fetch(searchUrl, {
            method: "GET",
            headers: customHeaders,
            next: { revalidate: 0 },
            cache: 'no-store'
        });

        if (!searchResponse.ok) {
            console.error(`Failed to fetch search results for song: ${query}`);
            return { error: "Failed to fetch search results", songId: null };
        }

        const jsonData = await searchResponse.json();
        const songs = jsonData.results || [];
        
        if (!songs.length) {
            console.error(`No results found for song: ${query}`);
            return { error: "Song not found", songId: null };
        }

        return { error: null, songId: songs[0].id };

    } catch (error) {
        console.error("Error fetching song details:", error);
        return { error: "Error fetching song details", songId: null };
    }
}

const getSongUrl = async (songId: string) => {
    try {
        const response = await fetch(`https://saavn.dev/api/songs/${songId}`)

        if (!response.ok) {
            console.log("Error fetching song URL:", response.statusText);
            return { error: "Failed to fetch song URL", data: null };
        }

        const data = await response.json();
        return { error: null, data: data.data[0] };

    } catch (error) {
        console.error("Error fetching song URL:", error);
        return { error: "Error fetching song URL", data: null };
    }
}

const appendSong = async (songData: any, playlistId: string) => {
    try {
        if (
            !songData ||
            !songData.id ||
            !songData.name ||
            !songData.artists?.primary ||
            !Array.isArray(songData.artists.primary) ||
            !songData.image?.[2]?.url ||
            !songData.downloadUrl?.[4]?.url
        ) {
            return { error: "Incomplete song data structure", success: false };
        }

        const savedSong = await addSong(
            songData.id,
            songData.name.replaceAll("&quot;", `"`),
            songData.artists.primary.map((artist: any) => artist.name).join(", ").replaceAll("&amp;", `-`),
            songData.image[2].url.replace("http:" , "https:"),
            songData.downloadUrl[4].url.replace("http:" , "https:")
        );

        const existingEntry = await db
            .select()
            .from(playlistSongsTable)
            .where(
                and(
                    eq(playlistSongsTable.playlistId, playlistId),
                    eq(playlistSongsTable.songId, savedSong.id)
                )
            );

        if (existingEntry.length > 0) {
            return { error: "Song already exists in this playlist", success: false };
        }

        await addSongToPlaylist(playlistId, savedSong.id);
        return { error: null, success: true };
    } catch (error) {
        console.error("Error adding song to playlist:", error);
        return { error: "Failed to add song", success: false };
    }
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const song = body.song;
        const playlistId = body.playlistId;

        const { error: searchError, songId } = await getSongDetails(song);
        if (searchError || !songId) {
            return NextResponse.json({ 
                error: searchError || "Song not found",
                success: false,
                skipped: true
            });
        }
        
        const { error: urlError, data: songData } = await getSongUrl(songId);
        if (urlError || !songData) {
            return NextResponse.json({ 
                error: urlError || "Failed to get song URL",
                success: false,
                skipped: true
            });
        }
        
        const { error: appendError, success } = await appendSong(songData, playlistId);
        
        return NextResponse.json({ 
            error: appendError,
            success: success,
            skipped: !success
        });
    } catch (error) {
        console.error("Error in POST handler:", error);
        return NextResponse.json({ 
            error: "Internal server error",
            success: false,
            skipped: true
        });
    }
}