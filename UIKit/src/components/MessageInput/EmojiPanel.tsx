import React, { useCallback, useMemo } from 'react'
import { FlatList, Pressable, StyleSheet, View, type ListRenderItemInfo } from 'react-native'
import { Text } from '../Text'
import { rpxToPx } from '../../utils/rpxToPx'
import { theme } from '../../utils/theme'

const DEFAULT_EMOJIS: string[] = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
  '😘', '😗', '☺️', '😚', '😙', '😋', '😛', '😜',
  '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐',
  '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬',
  '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒',
  '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵',
  '🤯', '🤠', '🥳', '😠', '😎', '🤓', '🧐', '😕',
  '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺',
  '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱',
  '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤',
  '😡', '🤬', '😈', '👿', '💀', '☠️', '🤡', '👹',
  '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹',
  '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉',
  '🙊', '💋', '💌', '💘', '💝', '💖', '💗', '💓',
  '💞', '💕', '💟', '❣️', '💔',
]

const COLUMNS = 8
const ROW_HEIGHT = rpxToPx(104)
const ITEM_SIZE = rpxToPx(60)
const ITEM_MARGIN = 4
const SIDE_PADDING = rpxToPx(48)
const PANEL_HEIGHT = rpxToPx(550)

export interface EmojiPanelProps {
  emojiList?: string[]
  onEmojiSelect?: (emoji: string) => void
  onEmojiLongPress?: (emoji: string) => void
  onEmojiDelete?: () => void
  backgroundColor?: string
}

interface EmojiRow {
  emojis: string[]
  rowIndex: number
}

const chunkEmojis = (list: string[]): EmojiRow[] => {
  const result: EmojiRow[] = []
  for (let i = 0; i < list.length; i += COLUMNS) {
    result.push({
      emojis: list.slice(i, i + COLUMNS),
      rowIndex: Math.floor(i / COLUMNS),
    })
  }
  return result
}

export const EmojiPanel: React.FC<EmojiPanelProps> = (props) => {
  const {
    emojiList = DEFAULT_EMOJIS,
    onEmojiSelect,
    onEmojiLongPress,
    onEmojiDelete,
    backgroundColor = '#FFFFFF',
  } = props

  const rows = useMemo(() => chunkEmojis(emojiList), [emojiList])

  const renderRow = useCallback(
    ({ item }: ListRenderItemInfo<EmojiRow>) => (
      <View style={styles.row}>
        {item.emojis.map((emoji, idx) => (
          <Pressable
            key={`${item.rowIndex}-${idx}`}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            onPress={() => onEmojiSelect?.(emoji)}
            onLongPress={() => onEmojiLongPress?.(emoji)}
            android_ripple={{ color: '#E0E0E0', borderless: true }}
          >
            <Text style={styles.emojiText}>{emoji}</Text>
          </Pressable>
        ))}
        {item.emojis.length < COLUMNS &&
          Array.from({ length: COLUMNS - item.emojis.length }).map((_, i) => (
            <View
              key={`empty-${i}`}
              style={[styles.item, { backgroundColor: 'transparent' }]}
            />
          ))}
      </View>
    ),
    [onEmojiSelect, onEmojiLongPress]
  )

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <FlatList
        data={rows}
        keyExtractor={(item) => `row-${item.rowIndex}`}
        renderItem={renderRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        getItemLayout={(_, index) => ({
          length: ROW_HEIGHT,
          offset: ROW_HEIGHT * index,
          index,
        })}
        ListFooterComponent={<View style={styles.footer} />}
      />
      <Pressable
        style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
        onPress={onEmojiDelete}
        hitSlop={8}
      >
        <Text style={styles.deleteBtnText}>⌫</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: PANEL_HEIGHT,
    flexDirection: 'row',
  },
  listContent: {
    paddingTop: rpxToPx(23),
    paddingBottom: rpxToPx(23),
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: SIDE_PADDING,
    height: ROW_HEIGHT,
  },
  item: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginRight: ITEM_MARGIN,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: rpxToPx(8),
  },
  itemPressed: {
    backgroundColor: '#E0E0E0',
  },
  emojiText: {
    fontSize: rpxToPx(52),
    lineHeight: rpxToPx(60),
  },
  footer: {
    height: rpxToPx(40),
  },
  deleteBtn: {
    position: 'absolute',
    right: rpxToPx(20),
    bottom: rpxToPx(20),
    borderRadius: rpxToPx(8),
    backgroundColor: '#F0F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnPressed: {
    backgroundColor: '#E0E0E0',
  },
  deleteBtnText: {
    fontSize: 20,
    paddingInline: 10,
    color: theme.textSecondary,
  },
})
