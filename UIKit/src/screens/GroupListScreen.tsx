import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { useNavigation, type NavigationProp } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { CustomNavbar } from '@tencentcloud/chat-uikit-react-native'
import { GroupList, type GroupInfo } from '@tencentcloud/chat-uikit-react-native'

type Nav = NavigationProp<any>

export const GroupListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const { t } = useTranslation()

  const handleBack = useCallback((): void => {
    navigation.goBack()
  }, [navigation])

  const handleGroupClick = useCallback(
    (group: GroupInfo): void => {
      navigation.navigate('Chat', {
        conversationID: `group_${group.groupID}`,
        type: 'GROUP',
        title: group.groupName,
      })
    },
    [navigation]
  )

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <CustomNavbar title={t('demo.screens.groupList.title')} onBack={handleBack} />
      <View style={styles.pageContent}>
        <GroupList onGroupSelect={handleGroupClick} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  pageContent: { flex: 1 },
})
