"use client"

import React from 'react'
import { useParams } from 'next/navigation'

const RoomDashboard = () => {
    const params = useParams()
    console.log('Room ID:', params.id)


    return (
        <div>RoomDashboard</div>
    )
}

export default RoomDashboard