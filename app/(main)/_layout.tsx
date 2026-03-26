import { Stack } from 'expo-router'

export default function MainStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="postDetails" options={{ presentation: 'modal' }} />
    </Stack>
  )
}
