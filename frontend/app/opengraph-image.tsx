import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: 'white',
          color: '#111',
          width: '100%',
          height: '100%',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        Vaantra
      </div>
    ),
    { ...size }
  )
}
