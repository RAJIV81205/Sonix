import { NextResponse } from "next/server";
import { addSong, addSongToPlaylist } from "@/lib/db/song";
import { db } from "@/lib/db";
import { playlistSongsTable } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

/**
 * Compare Spotify track data with JioSaavn song data to verify match quality
 * @param spotifyTrack - The Spotify track object
 * @param jioSaavnSong - The JioSaavn song object
 * @returns {Object} - Match confidence scores and comparison details
 */
const compareSongData = (spotifyTrack:any, jioSaavnSong:any) => {
    if (!spotifyTrack || !jioSaavnSong) {
        return { overallConfidence: 0, details: { error: "Missing comparison data" } };
    }

    // Extract relevant data from Spotify track
    const spotifyData = {
        name: spotifyTrack.track.name.toLowerCase().trim(),
        artist: spotifyTrack.track.artists[0].name.toLowerCase().trim(),
        album: spotifyTrack.track.album?.name.toLowerCase().trim() || "",
        duration: Math.floor(spotifyTrack.track.duration_ms / 1000) // Convert ms to seconds
    };

    // Extract relevant data from JioSaavn song
    const jioSaavnData = {
        name: jioSaavnSong.name.toLowerCase().trim(),
        artist: jioSaavnSong.artists?.primary?.[0]?.name.toLowerCase().trim() || "",
        album: jioSaavnSong.album?.name?.toLowerCase().trim() || "",
        duration: jioSaavnSong.duration
    };

    // Calculate match scores for each attribute
    const nameScore = calculateStringSimilarity(spotifyData.name, jioSaavnData.name);
    const artistScore = calculateStringSimilarity(spotifyData.artist, jioSaavnData.artist);
    const albumScore = spotifyData.album && jioSaavnData.album ? 
        calculateStringSimilarity(spotifyData.album, jioSaavnData.album) : 0.5;
    
    // Duration comparison with tolerance
    const durationDiff = Math.abs(spotifyData.duration - jioSaavnData.duration);
    const durationScore = durationDiff <= 3 ? 1 : // Perfect match (within 3 seconds)
                           durationDiff <= 10 ? 0.8 : // Close match
                           durationDiff <= 30 ? 0.5 : // Possible edit/radio version
                           0.2; // Large difference
    
    // Calculate overall confidence score (weighted average)
    // Name and artist are most important, duration helps confirm, album is least important
    const overallConfidence = (
        (nameScore * 0.45) + 
        (artistScore * 0.35) + 
        (durationScore * 0.15) + 
        (albumScore * 0.05)
    );
    
    return {
        overallConfidence,
        details: {
            nameScore,
            artistScore,
            albumScore,
            durationScore,
            spotifyData,
            jioSaavnData
        },
        isGoodMatch: overallConfidence >= 0.7 // Threshold for a good match
    };
};

/**
 * Calculate similarity between two strings
 * @param {string} str1 - First string to compare
 * @param {string} str2 - Second string to compare
 * @returns {number} - Similarity score between 0 and 1
 */
const calculateStringSimilarity = (str1:any, str2:any) => {
    if (!str1 && !str2) return 1; // Both empty = match
    if (!str1 || !str2) return 0; // One empty = no match
    
    // Normalize strings: lowercase, remove special chars
    const normalizeStr = (s:any) => s.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove special characters
        .replace(/\s+/g, ' ')    // Normalize whitespace
        .trim();
    
    const norm1 = normalizeStr(str1);
    const norm2 = normalizeStr(str2);
    
    // Exact match
    if (norm1 === norm2) return 1;
    
    // Check if one contains the other
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
        const longerLength = Math.max(norm1.length, norm2.length);
        const shorterLength = Math.min(norm1.length, norm2.length);
        return shorterLength / longerLength * 0.9; // Slight penalty for partial match
    }
    
    // Calculate Levenshtein distance for more complex comparison
    const distance = levenshteinDistance(norm1, norm2);
    const maxLength = Math.max(norm1.length, norm2.length);
    
    // Convert distance to similarity score (0-1)
    return maxLength === 0 ? 1 : (1 - distance / maxLength);
};

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} s1 - First string
 * @param {string} s2 - Second string
 * @returns {number} - Edit distance
 */
const levenshteinDistance = (s1:any, s2:any) => {
    const track = Array(s2.length + 1).fill(null).map(() => 
        Array(s1.length + 1).fill(null));
    
    for (let i = 0; i <= s1.length; i++) {
        track[0][i] = i;
    }
    
    for (let j = 0; j <= s2.length; j++) {
        track[j][0] = j;
    }
    
    for (let j = 1; j <= s2.length; j++) {
        for (let i = 1; i <= s1.length; i++) {
            const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1, // deletion
                track[j - 1][i] + 1, // insertion
                track[j - 1][i - 1] + indicator // substitution
            );
        }
    }
    
    return track[s2.length][s1.length];
};

const getSongDetails = async (song: any) => {
    const query = `${song.track.name.split("(")[0]} - ${song.track.artists[0].name}`;

    try {
        const searchUrl = `https://www.jiosaavn.com/api.php?p=1&q=${encodeURIComponent(query)}&_format=json&_marker=0&api_version=4&ctx=wap6dot0&n=20&__call=search.getResults`;

        const customHeaders = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Referer": "https://www.jiosaavn.com/",
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
            return NextResponse.json(
                { error: "Failed to fetch search results" },
                { status: searchResponse.status }
            );
        }

        const jsonData = await searchResponse.json();
        const songs = jsonData.results || [];
        
        // Return null if no songs found
        if (!songs.length) return null;
        
        // If we have multiple results, find the best match
        if (songs.length > 1) {
            // Store all song IDs with their basic info for comparison
            const potentialMatches = songs.slice(0, 3); // Check top 3 results
            return {
                id: songs[0].id, // Default to first result
                allMatches: potentialMatches
            };
        }
        
        return { id: songs[0].id };
    } catch (error) {
        console.error("Error fetching song details:", error);
        return null;
    }
};

const getSongUrl = async (songId: string) => {
    try {
        const response = await fetch(`https://saavn.dev/api/songs/${songId}`)

        if (!response.ok) {
            console.log("Error fetching song URL:", response.statusText);
            return null;
        }

        const data = await response.json();
        return data.data[0];
    } catch (error) {
        console.error("Error fetching song URL:", error);
        return null;
    }
};

const findBestSongMatch = async (spotifyTrack:any, jioSaavnMatches:any) => {
    // If we only have one match, just return it
    if (!jioSaavnMatches.allMatches || jioSaavnMatches.allMatches.length <= 1) {
        return jioSaavnMatches.id;
    }
    
    // Get full data for top 3 potential matches
    const detailedMatches = await Promise.all(
        jioSaavnMatches.allMatches.slice(0, 3).map(async (match:any) => {
            const songData = await getSongUrl(match.id);
            if (!songData) return null;
            
            const comparison = compareSongData(spotifyTrack, songData);
            return {
                id: match.id,
                confidence: comparison.overallConfidence,
                songData
            };
        })
    );
    
    // Filter out any null results
    const validMatches = detailedMatches.filter(match => match !== null);
    
    if (!validMatches.length) {
        return jioSaavnMatches.id; // Fall back to original ID if no valid matches
    }
    
    // Sort by confidence score and return the best match
    validMatches.sort((a, b) => b.confidence - a.confidence);
    
    // If best match has good confidence, use it
    if (validMatches[0].confidence >= 0.7) {
        return validMatches[0].id;
    }
    
    // Otherwise fall back to the original first result
    return jioSaavnMatches.id;
};

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
            throw new Error("Incomplete song data structure");
        }

        const savedSong = await addSong(
            songData.id,
            songData.name.replaceAll("&quot;", `"`),
            songData.artists.primary.map((artist: any) => artist.name).join(", ").replaceAll("&amp;", `-`),
            songData.image[2].url.replace("http:", "https:"),
            songData.downloadUrl[4].url.replace("http:", "https:")
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
            return "Song already exists in this playlist";
        }

        await addSongToPlaylist(playlistId, savedSong.id);
        return "Song added to playlist successfully";
    } catch (error) {
        console.error("Error adding song to playlist:", error);
        return "Failed to add song";
    }
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const song = body.song;
        const playlistId = body.playlistId;
        
        // Optional flag to enable detailed comparison
        const enableDetailedComparison = true;

        // Get JioSaavn song matches
        const songMatches = await getSongDetails(song);
        if (!songMatches) {
            return NextResponse.json({ error: "Song not found" }, { status: 404 });
        }
        
        // Find the best matching song if we have multiple matches
        let bestSongId;
        if (enableDetailedComparison) {
            bestSongId = await findBestSongMatch(song, songMatches);
        } else {
            bestSongId = songMatches.id  || songMatches;
        }
        
        // Get full song data using the best ID
        const songData = await getSongUrl(bestSongId);
        if (!songData) {
            return NextResponse.json({ error: "Failed to get song URL" }, { status: 404 });
        }
        
        // Before saving, verify this is a good match
        const matchQuality = compareSongData(song, songData);
        
        // Add song to playlist
        const saveResponse = await appendSong(songData, playlistId);
        
        return NextResponse.json({ 
            message: saveResponse,
            success: saveResponse === "Song added to playlist successfully",
            matchConfidence: matchQuality.overallConfidence,
            isGoodMatch: matchQuality.isGoodMatch
        });
    } catch (error) {
        console.error("Error in POST handler:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}