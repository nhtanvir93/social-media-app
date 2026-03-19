import Entypo from '@expo/vector-icons/Entypo'
import Feather from '@expo/vector-icons/Feather'
import Octicons from '@expo/vector-icons/Octicons'
import * as ImagePicker from 'expo-image-picker'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import Avatar from '@/components/Avatar'
import Button from '@/components/Button'
import Header from '@/components/Header'
import Input from '@/components/Input'
import ScreenWrapper from '@/components/ScreenWrapper'
import { theme } from '@/constants/theme'
import { heightPercentage } from '@/helpers/common'
import { useAuth } from '@/hooks/useAuth'
import { Database } from '@/utils/databases/types/database.types'
import { updateUserProfile } from '@/utils/databases/userProfile'
import { uploadFile } from '@/utils/fileUtil'

type UserProfileUpdate = Database['public']['Tables']['users']['Update']

const EditProfile = () => {
  const [userProfileUpdate, setUserProfileUpdate] = useState<UserProfileUpdate>({
    name: '',
    phoneNumber: '',
    bio: '',
    address: '',
    image: '',
  })
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null)
  const [loading, setLoading] = useState(false)

  const { userProfile, setUserProfile } = useAuth()

  useEffect(() => {
    if (userProfile) {
      setUserProfileUpdate(userProfile)
    }
  }, [userProfile])

  const handleSubmit = async () => {
    if (!userProfile) {
      return
    }

    const { name, phoneNumber, address, bio } = userProfileUpdate

    if (!name || !phoneNumber || !address || !bio) {
      Alert.alert('Profile', 'Pleass fill all the fields')
      return
    }

    let newProfileImage

    setLoading(true)

    if (image) {
      const uploadResponse = await uploadFile(image, '/profiles')

      if (!uploadResponse.success) {
        setLoading(false)
        Alert.alert('Profile', uploadResponse.message)
        return
      }

      newProfileImage = uploadResponse.publicFileUrl
    }

    const payload = newProfileImage
      ? { ...userProfileUpdate, image: newProfileImage }
      : userProfileUpdate

    const updatedUserProfile = await updateUserProfile(payload, userProfile.id)
    setUserProfile(updatedUserProfile)

    setLoading(false)
  }

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission required',
        'Permission to access the media library is required.',
      )
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    })

    if (!result.canceled) {
      setImage(result.assets[0])
    }
  }

  return (
    <ScreenWrapper withHeader={false}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View>
          <Header title="Edit Profile" />
        </View>
        <ScrollView style={styles.container}>
          <View style={styles.avatarContainer}>
            <Avatar
              size={heightPercentage(16)}
              rounded={theme.radius.xxl}
              uri={image?.uri || userProfileUpdate.image}
            />
            <View style={styles.shadowWrapper}>
              <Pressable
                onPress={pickImage}
                style={({ pressed }) => [
                  styles.editIconContainer,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Feather name="camera" size={20} color={theme.colors.primary} />
              </Pressable>
            </View>
          </View>
          <View style={styles.formContainer}>
            <Text style={styles.formInfoText}>Please fill your profile details</Text>
            <Input
              placeholder="Enter your name"
              onChangeText={(value) =>
                setUserProfileUpdate({ ...userProfileUpdate, name: value })
              }
              value={userProfileUpdate.name}
              icon={<Feather name="user" size={24} color={theme.colors.textLight} />}
            />
            <Input
              placeholder="Enter your phone number"
              onChangeText={(value) =>
                setUserProfileUpdate({ ...userProfileUpdate, phoneNumber: value })
              }
              value={userProfileUpdate.phoneNumber!}
              icon={<Entypo name="mobile" size={24} color={theme.colors.textLight} />}
            />
            <Input
              placeholder="Enter your address"
              onChangeText={(value) =>
                setUserProfileUpdate({ ...userProfileUpdate, address: value })
              }
              value={userProfileUpdate.address!}
              icon={<Entypo name="address" size={24} color={theme.colors.textLight} />}
            />
            <Input
              placeholder="Enter your bio"
              onChangeText={(value) =>
                setUserProfileUpdate({ ...userProfileUpdate, bio: value })
              }
              value={userProfileUpdate.bio!}
              multiline
              icon={<Octicons name="quote" size={24} color={theme.colors.textLight} />}
            />
            <Button title="Update" loading={loading} onPress={handleSubmit} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  )
}

export default EditProfile

const styles = StyleSheet.create({
  keyboardAvoidingWrapper: {
    flex: 1,
  },
  container: {
    marginTop: heightPercentage(12),
    gap: 20,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  shadowWrapper: {
    height: 40,
    width: 40,
    borderRadius: 999,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    position: 'absolute',
    right: -12,
    bottom: -7,
  },
  editIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formInfoText: {
    fontSize: heightPercentage(1.8),
    color: theme.colors.text,
  },
  formContainer: {
    marginTop: heightPercentage(5),
    gap: 20,
  },
})
