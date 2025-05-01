import { NextResponse } from "next/server"
import { addSong } from "@/lib/db/song"


export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { id, name, artist, image, url } = body
        const song = await addSong(id, name, artist, image, url)
        
        return NextResponse.json({ 
            success: true, 
            song 
        }, { status: 200 })
    } catch (error) {
        console.error('Error saving song:', error)
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to save song' 
        }, { status: 500 })
    }
}