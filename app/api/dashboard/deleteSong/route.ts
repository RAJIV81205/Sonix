import { deleteSongFromPlaylist , matchUserwithPlaylist } from "@/lib/db/song";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyToken } from "@/lib/middleware/verifyToken";

export async function DELETE(request: Request) {
    try {
        const headersList = await headers();
        const token = headersList.get("authorization")?.split(" ")[1];
        if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { playlistId, songId } = await request.json();
    const isUserMatch = await matchUserwithPlaylist(playlistId, decoded.userId);
    if (!isUserMatch) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }


    const data = await deleteSongFromPlaylist(playlistId, songId);
    return NextResponse.json(data, { status: 200 });

}catch(error){
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
}
}


