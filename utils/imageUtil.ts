import { File } from 'expo-file-system'

import { supabase } from '@/lib/supabase'

export const getUserImageSrcUrl = (imagePath: string | null | undefined) => {
  return imagePath || require('../assets/images/default-user.png')
}

export const getFileFromUri = async (uri: string): Promise<Blob | null> => {
  try {
    const response = await fetch(uri)

    if (!response.ok) {
      console.error(`Failed to fetch ${uri}: ${response.status}`)
      return null
    }

    const blob = await response.blob()

    if (!blob || blob.size === 0) {
      console.warn(`Empty file from URI: ${uri}`)
      return null
    }

    return blob
  } catch (error) {
    console.error(`Error reading file from URI: ${uri}`, error)
    return null
  }
}

type ValidFileSizeResult = { success: true } | { success: false; message: string }

export const isValidFileSize = (
  blob: Blob,
  customMaxFileSizeInMB?: number,
): ValidFileSizeResult => {
  const DEFAULT_MAX_FILE_SIZE = 10

  const maxFileSizeMB =
    customMaxFileSizeInMB ||
    Number(process.env.EXPO_PUBLIC_MAX_FILE_SIZE_IN_MB) ||
    DEFAULT_MAX_FILE_SIZE

  const MAX_FILE_SIZE = maxFileSizeMB * 1024 * 1024

  if (blob.size > MAX_FILE_SIZE) {
    return {
      success: false,
      message: `File size should not exceed ${maxFileSizeMB} MB`,
    }
  }

  return { success: true }
}

export const getFileType = (blob: Blob) => {
  const mimeType = blob.type

  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'

  return 'unknown'
}

type UploadResult =
  | { success: true; publicFileUrl: string }
  | { success: false; message: string }

export const uploadFile = async (fileUri: string): Promise<UploadResult> => {
  try {
    const blob = await getFileFromUri(fileUri)

    if (!blob) {
      return {
        success: false,
        message: 'Failed to read file',
      }
    }

    const sizeValidation = isValidFileSize(blob)
    if (!sizeValidation.success) return sizeValidation

    const EXTENSIONS = {
      image: '.png',
      video: '.mp4',
    }

    const fileType = getFileType(blob)

    if (!(fileType in EXTENSIONS) || fileType === 'unknown') {
      return {
        success: false,
        message: 'Unsupported file type',
      }
    }

    const fileName = `${Date.now()}${EXTENSIONS[fileType]}`
    const bucketId = process.env.EXPO_PUBLIC_BUCKET_ID || 'uploads'

    const fileArrayBuffer = await getFileArrayBuffer(fileUri)

    if (!fileArrayBuffer) {
      return {
        success: false,
        message: 'Failed to create array buffer for the uploaded file',
      }
    }

    console.log('Uploading to bucket:', bucketId)
    console.log('File size:', blob.size, 'Type:', blob.type)

    const { data, error } = await supabase.storage
      .from(bucketId)
      .upload(fileName, fileArrayBuffer, {
        contentType: blob.type || 'application/octet-stream',
        upsert: false,
      })

    if (error) {
      console.log('Upload error:', error)
      return {
        success: false,
        message: error.message || 'Upload failed',
      }
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketId)
      .getPublicUrl(data.path)

    return {
      success: true,
      publicFileUrl: publicUrlData.publicUrl,
    }
  } catch (err) {
    console.log('Upload failed:', err)
    return {
      success: false,
      message: 'Something went wrong, please try again',
    }
  }
}

export const getFileArrayBuffer = async (fileUri: string) => {
  try {
    const file = new File(fileUri)

    const arrayBuffer = await file.arrayBuffer()

    return arrayBuffer
  } catch (error) {
    console.log('Error reading file:', error)
    return null
  }
}
