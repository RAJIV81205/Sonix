import * as crypto from 'node-forge'
import { z } from 'zod'
import { DownloadLink, ArtistMap, ArtistMapAPIResponseModel } from '@/types/song'

export const createDownloadLinks = (encryptedMediaUrl: string): DownloadLink[] => {
  if (!encryptedMediaUrl) return []

  const qualities = [
    { id: '_12', bitrate: '12kbps' },
    { id: '_48', bitrate: '48kbps' },
    { id: '_96', bitrate: '96kbps' },
    { id: '_160', bitrate: '160kbps' },
    { id: '_320', bitrate: '320kbps' }
  ]

  const key = '38346591'
  const iv = '00000000'

  try {
    const encrypted = crypto.util.decode64(encryptedMediaUrl)
    const decipher = crypto.cipher.createDecipher('DES-ECB', crypto.util.createBuffer(key))
    decipher.start({ iv: crypto.util.createBuffer(iv) })
    decipher.update(crypto.util.createBuffer(encrypted))
    decipher.finish()
    const decryptedLink = decipher.output.getBytes()

    return qualities.map((quality) => ({
      quality: quality.bitrate,
      url: decryptedLink.replace('_96', quality.id)
    }))
  } catch (error) {
    console.error('Error decrypting media URL:', error)
    return []
  }
}

export const createImageLinks = (link: string): DownloadLink[] => {
  if (!link) return []

  const qualities = ['50x50', '150x150', '500x500']
  const qualityRegex = /150x150|50x50/
  const protocolRegex = /^http:\/\//

  return qualities.map((quality) => ({
    quality,
    url: link.replace(qualityRegex, quality).replace(protocolRegex, 'https://')
  }))
}

export const createArtistMapPayload = (artist: z.infer<typeof ArtistMapAPIResponseModel>): ArtistMap => ({
  id: artist.id,
  name: artist.name,
  role: artist.role,
  type: artist.type,
  image: createImageLinks(artist.image),
  url: artist.perma_url
})