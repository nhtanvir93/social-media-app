import Entypo from '@expo/vector-icons/Entypo'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { ResizeMode, Video } from 'expo-av'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { RichEditor } from 'react-native-pell-rich-editor'

import Avatar from '@/components/Avatar'
import Button from '@/components/Button'
import FilePreview from '@/components/FilePreview'
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import RichTextEditor from '@/components/RichTextEditor'
import ScreenWrapper from '@/components/ScreenWrapper'
import { theme } from '@/constants/theme'
import { heightPercentage } from '@/helpers/common'
import { useAuth } from '@/hooks/useAuth'
import { createOrUpdatePost } from '@/utils/databases/post'
import { Database } from '@/utils/databases/types/database.types'
import { uploadFile } from '@/utils/fileUtil'

type OldPost = {
  postId?: string
  postBody?: string
  fileUrl?: string
}

type PostPayload = Database['public']['Tables']['posts']['Update']

const CreatePost = () => {
  const { postId, postBody, fileUrl } = useLocalSearchParams<OldPost>()
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [file, setFile] = useState<ImagePicker.ImagePickerAsset | null>(null)

  const editorRef = useRef<RichEditor>(null)
  const bodyRef = useRef('')

  const { userProfile } = useAuth()
  const router = useRouter()

  const handleSubmit = async () => {
    if (!userProfile) {
      Alert.alert('Create Post', 'No logged in found to create the post')
      return
    }

    if (!bodyRef.current && !file) {
      Alert.alert('Create Post', 'Please choose a media or add post body')
      return
    }

    try {
      let newPostFile = ''

      setLoading(true)

      if (file) {
        const folder = '/post-' + file.type + 's'
        const uploadResponse = await uploadFile(file, folder)

        if (!uploadResponse.success) {
          setLoading(false)
          Alert.alert('Create Post', uploadResponse.message)
          return
        }

        newPostFile = uploadResponse.publicFileUrl
      }

      const postPayload: PostPayload = {
        userId: userProfile.id,
      }

      if (postId) {
        postPayload.id = postId
      }

      if (bodyRef.current) {
        postPayload.body = bodyRef.current
      }

      if (newPostFile) {
        postPayload.file = newPostFile
      }

      await createOrUpdatePost(postPayload)

      router.back()
    } catch (err: unknown) {
      console.log('Error in upserting post', err)

      if (err instanceof Error) {
        Alert.alert('Create Post', 'Failed to create the post')
      }
    } finally {
      setLoading(false)
    }
  }

  const pickFile = async (isImage: boolean) => {
    let mediaConfig: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    }

    if (!isImage) {
      mediaConfig = {
        mediaTypes: ['videos'],
        allowsEditing: true,
      }
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission required',
        'Permission to access the media library is required.',
      )
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync(mediaConfig)

    if (!result.canceled) {
      setPreviewLoading(true)
      setFile(result.assets[0])
    }
  }

  useEffect(() => {
    setTimeout(() => {
      bodyRef.current = postBody ?? ''
      editorRef.current?.setContentHTML(postBody ?? '')
    }, 300)
  }, [postBody])

  return (
    <ScreenWrapper withHeader={false}>
      <View>
        <Header title={`${postId ? 'Update' : 'Create'} Post`} />
      </View>
      <View style={styles.container}>
        <View style={styles.publisherContainer}>
          <Avatar uri={userProfile?.image} size={heightPercentage(6.5)} />
          <View>
            <Text style={styles.publisher}>{userProfile?.name}</Text>
            <Text style={styles.publisherTag}>Public</Text>
          </View>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formContainer}
        >
          <RichTextEditor
            editorRef={editorRef}
            onChange={(html) => (bodyRef.current = html)}
          />
          {!file && fileUrl && <FilePreview fileUrl={fileUrl} />}
          {file && (
            <View>
              {file.type === 'image' && (
                <Image
                  source={file.uri}
                  contentFit="cover"
                  onLoadEnd={() => setPreviewLoading(false)}
                  style={styles.imagePreview}
                />
              )}
              {file.type === 'video' && (
                <Video
                  source={{ uri: file.uri }}
                  style={styles.imagePreview}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  onLoad={() => setPreviewLoading(false)}
                />
              )}
              {previewLoading && (
                <View style={styles.previewLoader}>
                  <Loading size="small" />
                </View>
              )}
              <Pressable onPress={() => setFile(null)} style={styles.removeBtn}>
                <View>
                  <MaterialCommunityIcons
                    name="delete"
                    size={16}
                    color={theme.colors.rose}
                  />
                </View>
              </Pressable>
            </View>
          )}
          <View style={styles.mediaContainer}>
            <Text style={styles.mediaText}>Add to you post</Text>
            <View style={styles.mediaIcons}>
              <Pressable
                onPress={() => pickFile(true)}
                style={({ pressed }) => pressed && { opacity: 0.6 }}
              >
                <Entypo name="images" size={24} color={theme.colors.textLight} />
              </Pressable>
              <Pressable
                onPress={() => pickFile(false)}
                style={({ pressed }) => pressed && { opacity: 0.6 }}
              >
                <MaterialIcons
                  name="video-library"
                  size={24}
                  color={theme.colors.textLight}
                />
              </Pressable>
            </View>
          </View>
        </ScrollView>
        <Button
          title={postId ? 'Update' : 'Post'}
          loading={loading}
          onPress={handleSubmit}
          btnStyle={styles.submitBtn}
        />
      </View>
    </ScreenWrapper>
  )
}

export default CreatePost

const styles = StyleSheet.create({
  container: {
    marginTop: heightPercentage(10),
    flex: 1,
    gap: 10,
  },
  publisherContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  publisher: {
    height: heightPercentage(2.2),
    letterSpacing: 2,
    color: theme.colors.text,
    fontWeight: theme.fonts.extraBold,
  },
  publisherTag: {
    height: heightPercentage(1.7),
    letterSpacing: 2,
    color: theme.colors.textLight,
  },
  mediaContainer: {
    paddingVertical: heightPercentage(1.5),
    paddingHorizontal: heightPercentage(2.2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0.4,
    borderColor: theme.colors.textLight,
    borderRadius: theme.radius.xxl,
  },
  mediaText: {
    color: theme.colors.textLight,
  },
  mediaIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  formContainer: {
    gap: 10,
    paddingBottom: heightPercentage(8),
  },
  submitBtn: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  imagePreview: {
    flex: 1,
    borderRadius: theme.radius.lg,
    height: heightPercentage(20),
    borderWidth: 0.4,
    borderColor: theme.colors.textLight,
  },
  removeBtn: {
    padding: 4,
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: '50%',
  },
  previewLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
