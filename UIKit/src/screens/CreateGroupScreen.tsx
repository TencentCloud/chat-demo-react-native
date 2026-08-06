import React, { useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute, type NavigationProp, type RouteProp } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { CustomNavbar } from '@tencentcloud/chat-uikit-react-native'
import {
  CreateGroup,
  type CreateGroupUserLite,
  type GroupType,
} from '@tencentcloud/chat-uikit-react-native'
import type { User } from '@tencentcloud/chat-uikit-react-native'

type Nav = NavigationProp<any> & {
  replace: <RouteName extends keyof never>(
    name: RouteName,
    params?: { conversationID: string; type: 'C2C' | 'GROUP'; title?: string }
  ) => void
}
type CreateGroupRoute = RouteProp<
  { CreateGroup: { selectedUsers?: User[] } },
  'CreateGroup'
>

export const CreateGroupScreen: React.FC = () => {
  const navigation = useNavigation<Nav>()
  const route = useRoute<CreateGroupRoute>()
  const { t } = useTranslation()

  const [groupType, setGroupType] = useState<GroupType | undefined>(undefined)

  const handleBack = useCallback((): void => {
    navigation.goBack()
  }, [navigation])

  const handleNavigateToGroupType = useCallback(
    (_currentTypeId: string): void => {
      navigation.navigate('GroupTypeInfo', {
        onSelect: (selectedType: GroupType): void => {
          setGroupType(selectedType)
        },
      })
    },
    [navigation]
  )

  const selectedUsers: CreateGroupUserLite[] = useMemo((): CreateGroupUserLite[] => {
    const source: User[] = route.params?.selectedUsers ?? []
    return source.map((u: User): CreateGroupUserLite => ({
      userID: u.userID,
      nickname: u.nickname && u.nickname.length > 0 ? u.nickname : u.userID,
    }))
  }, [route.params?.selectedUsers])

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <CustomNavbar title={t('demo.screens.createGroup.title')} onBack={handleBack} />
      <View style={styles.page}>
        <CreateGroup
          selectedUsers={selectedUsers}
          controlledGroupType={groupType}
          onNavigateToGroupType={handleNavigateToGroupType}
          onCreateSuccess={useCallback(
            (data: { groupID: string; conversationID: string }) => {
              console.log('[CreateGroupScreen] create group success:', data)
              navigation.replace('Chat', {
                conversationID: data.conversationID,
                type: 'GROUP',
                title: t('demo.screens.chat.title.group'),
              })
            },
            [navigation, t]
          )}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  page: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
})
