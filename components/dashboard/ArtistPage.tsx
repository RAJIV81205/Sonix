"use client"

import React, { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

const ArtistPage = () => {
    const [artist, setArtist] = useState(null)

    const param = useParams().id

    useEffect(() => {
        const fetchArtist = async () =>{
            try {
                
            } catch (error:any) {
                console.error("Error fetching artist:", error.message);
                toast.error("Error fetching artist:", error.message) 
                
            }
        } 

        fetchArtist()
    }, [param])


  return (
    <div>ArtistPage {param}</div>

  )
}

export default ArtistPage