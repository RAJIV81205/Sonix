"use client"

import React from 'react'
import { useParams } from 'next/navigation'

const ArtistPage = () => {
    const param = useParams().id
    console.log(param)
  return (
    <div>ArtistPage {param}</div>

  )
}

export default ArtistPage