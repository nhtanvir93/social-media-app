import { supabase } from '@/lib/supabase'

export const getUserImageSrcUrl = (imagePath: string | null | undefined) => {
  if (imagePath) {
    return imagePath
  } else {
    return require('../assets/images/default-user.png')
  }
}

export const getBlobFromUri = async (uri: string): Promise<Blob | null> => {
  try {
    const response = await fetch(uri)

    if (!response.ok) {
      console.error(`Failed to fetch ${uri}: ${response.status} ${response.statusText}`)
      return null
    }

    const blob = await response.blob()

    if (!blob || blob.size === 0) {
      console.warn(`No blob created from URI: ${uri}`)
      return null
    }

    return blob
  } catch (error) {
    console.error(`Error creating blob from URI: ${uri}`, error)
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

  return {
    success: true,
  }
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

export const uploadFile = async (uri: string): Promise<UploadResult> => {
  try {
    const blob = await getBlobFromUri(uri)

    if (blob === null) {
      return {
        success: false,
        message: 'Failed to create blob file',
      }
    }

    const sizeValidation = isValidFileSize(blob)
    if (!sizeValidation.success) {
      return sizeValidation
    }

    const EXTENSIONS = {
      image: '.png',
      video: '.mp4',
    }
    const contentType = getFileType(blob)
    if (!(contentType in EXTENSIONS) || contentType === 'unknown') {
      return {
        success: false,
        message: 'No content type declared for the uploading file',
      }
    }

    const fileName = `${Date.now()}${EXTENSIONS[contentType]}`
    const bucketId = process.env.EXPO_PUBLIC_BUCKET_ID || 'uploads'

    console.log(`BuckedID : ${bucketId}`)

    const { data, error } = await supabase.storage.from(bucketId).upload(fileName, blob, {
      upsert: false,
      contentType: `${contentType}/*`,
    })

    if (error) {
      console.log('Upload error:', error)
      return {
        success: false,
        message: 'Failed to upload the file',
      }
    }

    return {
      success: true,
      publicFileUrl: supabase.storage.from(bucketId).getPublicUrl(data.path).data
        .publicUrl,
    }
  } catch (err) {
    console.log('Upload failed:', err)
    return {
      success: false,
      message: 'Something went wrong, please try again',
    }
  }
}
