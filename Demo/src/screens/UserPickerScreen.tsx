import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { CustomNavbar } from '@tencentcloud/chat-uikit-react-native'
import { UserPicker } from '@tencentcloud/chat-uikit-react-native'
import { USER_PICKER_TYPE, type UserPickerType } from '@tencentcloud/chat-uikit-react-native'
import type { User } from '@tencentcloud/chat-uikit-react-native'

const TITLE_KEY_MAP: Record<number, string> = {
  [USER_PICKER_TYPE.SELECT_GROUP_AT_USER]: 'demo.screens.userPicker.title.selectGroupAtUser',
}

type RootStackParamList = {
  UserPicker: { businessType: UserPickerType; routeParams?: Record<string, any> }
}

type UserPickerRouteProp = RouteProp<RootStackParamList, 'UserPicker'>
type UserPickerNavProp = NativeStackNavigationProp<RootStackParamList, 'UserPicker'>

export const UserPickerScreen: React.FC = () => {
  const navigation = useNavigation<UserPickerNavProp>()
  const route = useRoute<UserPickerRouteProp>()
  const { t } = useTranslation()

  const businessType = route.params?.businessType
  const routeParams = route.params?.routeParams ?? {}

  const handleConfirm = (selectedUsers: User[]): void => {
    console.log('selectedUsers:', selectedUsers, businessType)
    if (
      businessType === USER_PICKER_TYPE.SELECT_GROUP_MEMBER ||
      businessType === USER_PICKER_TYPE.SELECT_GROUP_AT_USER
    ) {
      const onSelect: ((data: { selectedUsers: User[] }) => void) | undefined = (
        routeParams as { onSelect?: (data: { selectedUsers: User[] }) => void }
      ).onSelect
      onSelect?.({ selectedUsers })
    }
    if (businessType !== USER_PICKER_TYPE.C2C_CONVERSATION && businessType !== USER_PICKER_TYPE.CREATE_GROUP) {
      navigation.goBack()
    }
  }

  const handleBack = useCallback((): void => {
    navigation.goBack()
  }, [navigation])

  const title = t(TITLE_KEY_MAP[businessType] ?? 'demo.screens.userPicker.title.default')

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <CustomNavbar title={title} onBack={handleBack} />
      <View style={styles.container}>
        <UserPicker
          businessType={businessType}
          routeParams={routeParams}
          onConfirm={handleConfirm}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
})

export default UserPickerScreen
