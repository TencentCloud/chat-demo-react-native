import React, { useMemo } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { UserResultItem } from './User'
import { GroupResultItem } from './Group'
import { MessageResultItem } from './Message'
import { ConversationResultItem } from './Conversation'
import { SearchResultItemEmits, SearchResultItemProps } from '../types'

import { Avatar as DefaultAvatar } from '../../Avatar/Avatar'

export const SearchResultItem: React.FC<SearchResultItemProps & { onClick?: SearchResultItemEmits['click'] }> = (props) => {
  const { type, data, keyword = '', Avatar = DefaultAvatar, onClick } = props

  const handleClick = () => onClick?.(type, data)

  const inner = useMemo(() => {
    switch (type) {
      case 'user':
        return <UserResultItem type="user" user={data as any} keyword={keyword} Avatar={Avatar} />
      case 'friend':
        return <UserResultItem type="friend" user={data as any} keyword={keyword} Avatar={Avatar} />
      case 'group':
        return <GroupResultItem group={data as any} keyword={keyword} Avatar={Avatar} />
      case 'groupMember':
        return <UserResultItem type="groupMember" user={data as any} keyword={keyword} Avatar={Avatar} />
      case 'message':
        return <MessageResultItem message={data as any} keyword={keyword} Avatar={Avatar} />
      case 'conversation':
        return <ConversationResultItem messageResult={data as any} keyword={keyword} Avatar={Avatar} />
      default:
        return <UserResultItem type="user" user={data as any} keyword={keyword} Avatar={Avatar} />
    }
  }, [type, data, keyword, Avatar])

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={handleClick} style={styles.container}>
      {inner}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default SearchResultItem
