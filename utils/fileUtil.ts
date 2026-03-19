import { File } from 'expo-file-system'
import { ImagePickerAsset } from 'expo-image-picker'

import { supabase } from '@/lib/supabase'

export const getUserImageSrcUrl = (imagePath: string | null | undefined) => {
  return imagePath || require('../assets/images/default-user.png')
}

type ValidFileSizeResult = { success: true } | { success: false; message: string }

export const isValidFileSize = (file: ImagePickerAsset): ValidFileSizeResult => {
  const DEFAULT_MAX_FILE_SIZE = 10

  const maxFileSizeMB =
    Number(process.env.EXPO_PUBLIC_MAX_FILE_SIZE_IN_MB) || DEFAULT_MAX_FILE_SIZE

  const MAX_FILE_SIZE = maxFileSizeMB * 1024 * 1024

  if (file.fileSize && file.fileSize > MAX_FILE_SIZE) {
    return {
      success: false,
      message: `File size should not exceed ${maxFileSizeMB} MB`,
    }
  }

  return { success: true }
}

type UploadResult =
  | { success: true; publicFileUrl: string }
  | { success: false; message: string }

export const uploadFile = async (
  file: ImagePickerAsset,
  folder?: string,
): Promise<UploadResult> => {
  try {
    if (!file.fileSize || !file.type || !file.uri || !file.mimeType) {
      return {
        success: false,
        message: 'File uri, mime type, type or size is missing',
      }
    }

    const sizeValidation = isValidFileSize(file)
    if (!sizeValidation.success) return sizeValidation

    const EXTENSIONS: Record<'image' | 'video', string> = {
      image: '.png',
      video: '.mp4',
    }

    if (!(file.type in EXTENSIONS)) {
      return {
        success: false,
        message: 'Unsupported file type',
      }
    }

    const fileName = `${folder}/${Date.now()}${EXTENSIONS[file.type as keyof typeof EXTENSIONS]}`

    const bucketId = process.env.EXPO_PUBLIC_BUCKET_ID || 'uploads'

    const fileArrayBuffer = await getFileArrayBuffer(file.uri)

    if (!fileArrayBuffer) {
      return {
        success: false,
        message: 'Failed to create array buffer for the uploaded file',
      }
    }

    console.log('Uploading to bucket:', bucketId)
    console.log('File size:', file.fileSize, 'Type:', file.type)

    const { data, error } = await supabase.storage
      .from(bucketId)
      .upload(fileName, fileArrayBuffer, {
        contentType: file.mimeType || 'application/octet-stream',
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
