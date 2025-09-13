import { NextResponse } from "next/server";
import getChosicToken from "@/lib/middleware/ChosicToken";

export async function POST(request: Request) {
    try {
        const { url } = await request.json();
        
        // Check if the playlist URL is provided
        if (!url) {
            return NextResponse.json({ error: "Playlist URL is required" }, { status: 400 });
        }
        
        // Extract playlist ID from URL - handle different URL formats
        let playlistId;
        try {
            // Handle both full URLs and just IDs
            if (url.includes('spotify.com/playlist/')) {
                // Extract the ID from the URL
                const urlParts = url.split('spotify.com/playlist/')[1];
                playlistId = urlParts.split('?')[0]; // Remove any query params
            } else {
                // Assume it's just the ID
                playlistId = url;
            }
            
            console.log("Extracted Playlist ID:", playlistId);
            
            if (!playlistId) {
                return NextResponse.json({ error: "Invalid Spotify playlist URL" }, { status: 400 });
            }
        } catch (error) {
            console.error("Error parsing playlist URL:", error);
            return NextResponse.json({ error: "Invalid Spotify playlist URL format" }, { status: 400 });
        }
        
        // Get client credentials from environment variables
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
        
        if (!clientId || !clientSecret) {
            console.error("Missing Spotify credentials in environment variables");
            return NextResponse.json({ 
                error: "Server configuration error: Missing Spotify credentials" 
            }, { status: 500 });
        }
        
        let token = await getChosicToken();
        
        // try {
        //     // Generate token using fetch
        //     console.log("Requesting Spotify access token");
            
        //     // Prepare the request body for token endpoint
        //     const tokenRequestBody = new URLSearchParams({
        //         grant_type: 'client_credentials',
        //         client_id: clientId,
        //         client_secret: clientSecret
        //     });
            
        //     // Make request to Spotify token endpoint
        //     const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/x-www-form-urlencoded"
        //         },
        //         body: tokenRequestBody.toString()
        //     });
            
        //     if (!tokenResponse.ok) {
        //         const errorData = await tokenResponse.json().catch(() => ({}));
        //         console.error("Failed to get Spotify token:", errorData);
        //         return NextResponse.json({ 
        //             error: "Failed to obtain access token from Spotify", 
        //             details: errorData 
        //         }, { status: tokenResponse.status });
        //     }
            
        //     const tokenData = await tokenResponse.json();
        //     token = tokenData.access_token;
            
        //     if (!token) {
        //         console.error("No token received:", tokenData);
        //         return NextResponse.json({ 
        //             error: "Invalid response from Spotify authentication" 
        //         }, { status: 500 });
        //     }
            
        //     console.log("Token generated successfully");
        // } catch (error: any) {
        //     console.error("Token generation error:", error);
        //     return NextResponse.json({ 
        //         error: "Error generating Spotify token" 
        //     }, { status: 500 });
        // }

        // Make the request to Spotify API to import the playlist
      
      
        console.log("Sending request to Spotify API for playlist:", playlistId);
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        });
        
        // Handle API response
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Spotify API error:", errorData);
            
            // Provide more specific error message based on status code
            let errorMessage = "Failed to fetch playlist";
            if (response.status === 404) {
                errorMessage = "Playlist not found. Please check the URL and try again.";
            } else if (response.status === 401) {
                errorMessage = "Authentication error with Spotify API";
            }
            
            return NextResponse.json({ 
                error: errorMessage, 
                details: errorData 
            }, { status: response.status });
        }
        
        // Get initial playlist data
        const data = await response.json();
        const allTracks = [...data.tracks.items];
        
        // Fetch additional tracks if there are more than 100
        if (data.tracks.total > 100) {
            console.log(`Playlist has ${data.tracks.total} tracks. Fetching additional batches...`);
            
            let nextUrl = data.tracks.next;
            while (nextUrl) {
                console.log(`Fetching next batch from: ${nextUrl}`);
                const moreTracksResponse = await fetch(nextUrl, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                });
                
                if (!moreTracksResponse.ok) {
                    console.error("Error fetching additional tracks:", moreTracksResponse.statusText);
                    break; // Continue with what we have so far
                }
                
                const moreTracksData = await moreTracksResponse.json();
                allTracks.push(...moreTracksData.items);
                nextUrl = moreTracksData.next;
                
                console.log(`Fetched batch of ${moreTracksData.items.length} tracks. Total so far: ${allTracks.length}`);
            }
        }
        
        // Update the data object with all tracks
        const completePlaylistData = {
            ...data,
            tracks: {
                ...data.tracks,
                items: allTracks,
                total: allTracks.length
            }
        };
        
        // Return the successful response with complete playlist data
        console.log(`Playlist "${data.name}" fetched successfully with all ${allTracks.length} tracks`);
        return NextResponse.json({
            success: true,
            playlist: completePlaylistData
        });
    } catch (error: any) {
        console.error("Error fetching playlist:", error);
        return NextResponse.json({ error: error.message || "Unknown error occurred" }, { status: 500 });
    }
}