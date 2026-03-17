export const getUserImageSrcUrl = (imagePath: string | null | undefined) => {
  if (imagePath) {
    return imagePath
  } else {
    return require('../assets/images/default-user.png')
  }
}
