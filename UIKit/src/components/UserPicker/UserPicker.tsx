import React, { useEffect, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { UserPickerList } from './components/UserPickerList'
import { useUserPicker } from './service'
import { type UserPickerType } from './const'
import type { User } from './types/user'
import { showToast } from '../../utils/toast'
import { useTranslation } from 'react-i18next'

export interface UserPickerProps {
  businessType: UserPickerType
  routeParams?: Record<string, any>
}

export interface UserPickerEmits {
  onConfirm?: (selectedUsers: User[]) => void
  onError?: (err: Error) => void
}

export const UserPicker: React.FC<UserPickerProps & UserPickerEmits> = ({
  businessType,
  routeParams = {},
  onConfirm,
  onError,
}) => {
  const { t } = useTranslation()
  const pickerResult = useUserPicker(businessType, routeParams)

  const {
    userList,
    lockedItems,
    maxCount,
    title,
    handleConfirm: confirmHandler,
    handleCancel: cancelHandler,
    singleSelect: hookSingleSelect,
    pinnedTopItems,
    onSearchChange,
    enableSearch: hookEnableSearch,
  } = pickerResult


  const singleSelect = useMemo<boolean>(
    () => !!hookSingleSelect,
    [hookSingleSelect]
  )

  const pinnedTopList = useMemo<User[]>(() => pinnedTopItems || [], [pinnedTopItems])

  const remoteSearch = useMemo<boolean>(
    () => typeof onSearchChange === 'function',
    [onSearchChange]
  )

  const enableSearch = useMemo<boolean>(() => {
    if (hookEnableSearch != null) return !!hookEnableSearch
    if (routeParams && routeParams.enableSearch != null) {
      const v = routeParams.enableSearch
      return !(v === false || v === 'false' || v === 0 || v === '0')
    }
    return true
  }, [hookEnableSearch, routeParams])

  const handleConfirm = async (selectedUsers: User[]): Promise<void> => {
    try {
      await confirmHandler(selectedUsers)
      onConfirm?.(selectedUsers)
    } catch (err: any) {
      console.error('[UserPicker] handleConfirm failed:', err)
      const error: Error = err instanceof Error ? err : new Error(String(err))
      showToast(error.message || t('toast.operationFailed'))
      onError?.(error)
    }
  }

  const handleSearchChange = async (keyword: string): Promise<void> => {
    if (onSearchChange == null) return
    try {
      await onSearchChange(keyword)
    } catch (err: any) {
      console.error('[UserPicker] handleSearchChange failed:', err)
      const error: Error = err instanceof Error ? err : new Error(String(err))
      showToast(error.message || t('userPicker.searchFailed'))
      onError?.(error)
    }
  }

  void cancelHandler 
  useEffect((): (() => void) | void => {
    return (): void => {
    }
  }, [])

  return (
    <View style={styles.userPickerPage}>
      <UserPickerList
        maxCount={maxCount}
        dataSource={userList}
        lockedItems={lockedItems}
        title={title}
        singleSelect={singleSelect}
        pinnedTopItems={pinnedTopList}
        remoteSearch={remoteSearch}
        enableSearch={enableSearch}
        onConfirm={handleConfirm}
        onSearchChange={handleSearchChange}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  userPickerPage: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
})


export default UserPicker
