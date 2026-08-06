import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { useNavigation, useRoute, type RouteProp, type NavigationProp } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { CustomNavbar } from '@tencentcloud/chat-uikit-react-native'
import { GroupTypeInfo } from '@tencentcloud/chat-uikit-react-native'
import { getGroupTypeById, type GroupType } from '@tencentcloud/chat-uikit-react-native'

type Nav = NavigationProp<any>

type GroupTypeInfoParams = {
  onSelect?: (groupType: GroupType) => void
}

export const GroupTypeInfoScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const { t } = useTranslation()
  const route = useRoute<RouteProp<{ GroupTypeInfo: GroupTypeInfoParams }, 'GroupTypeInfo'>>()

  const handleSelectType = useCallback(
    (groupTypeId: string): void => {
      const groupType = getGroupTypeById(groupTypeId)
      if (groupType) {
        if (route.params?.onSelect) {
          route.params.onSelect(groupType)
        }
        navigation.goBack()
      }
    },
    [navigation, route.params]
  )

  const handleBack = useCallback((): void => {
    navigation.goBack()
  }, [navigation])

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <CustomNavbar title={t('demo.screens.groupTypeInfo.title')} onBack={handleBack} />
      <View style={styles.page}>
        <GroupTypeInfo showDocumentationLink onSelectType={handleSelectType} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  page: { flex: 1 },
})
