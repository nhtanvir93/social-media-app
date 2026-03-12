import { Dimensions } from 'react-native'

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window')

export const heightPercentage = (percentage: number) => {
  return (deviceHeight * percentage) / 100
}

export const widthPercentage = (percentage: number) => {
  return (deviceWidth * percentage) / 100
}
