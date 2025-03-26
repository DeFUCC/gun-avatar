import { ref } from 'vue'
import extract from 'png-chunks-extract'
import encode from 'png-chunks-encode'
import text from 'png-chunk-text'

export const error = ref(null)

function canvasToBuffer(canvas) {
  try {
    const base64 = canvas.toDataURL('image/png').split(',')[1]
    const bytes = atob(base64)
    const buffer = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) {
      buffer[i] = bytes.charCodeAt(i)
    }
    return buffer
  } catch (e) {
    error.value = 'Failed to convert canvas to buffer: ' + e.message
    return null
  }
}

export function embedInImage(canvas, data) {
  try {
    const buffer = canvasToBuffer(canvas)
    if (!buffer) return null

    const chunks = extract(buffer)
    chunks.splice(-1, 0, text.encode('message', JSON.stringify(data)))
    return encode(chunks)
  } catch (e) {
    error.value = 'Failed to embed data: ' + e.message
    return null
  }
}

export function extractFromBuffer(buffer) {
  try {
    const chunks = extract(buffer)
    const textChunks = chunks
      .filter(chunk => chunk.name === 'tEXt')
      .map(chunk => text.decode(chunk.data))

    const messageChunk = textChunks.find(chunk => chunk.keyword === 'message')
    return messageChunk ? JSON.parse(messageChunk.text) : null
  } catch (e) {
    error.value = e.message
    return null
  }
}

// Keep this async function for File inputs only
export async function extractFromFile(file) {
  try {
    if (!(file instanceof File)) {
      throw new Error('Input must be a File object')
    }
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)
    return await extractFromBuffer(buffer)
  } catch (e) {
    error.value = e.message
    return null
  }
}

