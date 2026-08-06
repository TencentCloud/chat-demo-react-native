export const AT_ALL_TAG = '__kImSDK_MesssageAtALL__'

export const MAX_AT_USER_COUNT = 30

export type MentionSegment = {
  userID: string
  displayName: string
  start: number
  end: number
}

export type MentionContext = {
  active: boolean
  anchor: number
  keyword: string
}

export type InsertResult = {
  newText: string
  newCursor: number
}

export const detectMentionContext = (text: string, cursor: number): MentionContext => {
  let i: number = cursor - 1
  while (i >= 0) {
    const ch: string = text[i]
    if (ch === '@') {
      const ctx: MentionContext = {
        active: true,
        anchor: i,
        keyword: text.slice(i + 1, cursor),
      }
      return ctx
    }
    if (ch === ' ' || ch === '\n') {
      const ctx: MentionContext = {
        active: false,
        anchor: -1,
        keyword: '',
      }
      return ctx
    }
    i--
  }
  const defaultCtx: MentionContext = {
    active: false,
    anchor: -1,
    keyword: '',
  }
  return defaultCtx
}

export const insertMention = (
  text: string,
  anchor: number,
  keywordLen: number,
  displayName: string,
): InsertResult => {
  const segment: string = `@${displayName} `
  const newText: string =
    text.slice(0, anchor) + segment + text.slice(anchor + 1 + keywordLen)
  return { newText, newCursor: anchor + segment.length }
}

export const scanMentions = (
  text: string,
  selectedMembers: Map<string, string>,
): MentionSegment[] => {
  const result: MentionSegment[] = []
  selectedMembers.forEach((userID: string, displayName: string) => {
    const needle: string = `@${displayName} `
    let idx: number = text.indexOf(needle)
    while (idx !== -1) {
      result.push({
        userID,
        displayName,
        start: idx,
        end: idx + needle.length,
      })
      idx = text.indexOf(needle, idx + needle.length)
    }
  })
  return result.sort(
    (a: MentionSegment, b: MentionSegment): number => a.start - b.start,
  )
}

export const tryDeleteWholeMention = (
  oldText: string,
  newText: string,
  oldCursor: number,
  oldMentions: MentionSegment[],
): InsertResult | null => {
  if (oldText.length - newText.length !== 1) return null
  const hit: MentionSegment | null =
    oldMentions.find((m: MentionSegment): boolean => m.end === oldCursor) ?? null
  if (hit == null) return null
  const finalText: string = oldText.slice(0, hit.start) + oldText.slice(hit.end)
  return { newText: finalText, newCursor: hit.start }
}
