
let _audioConvertVisibleMap: Map<string, boolean> = new Map<string, boolean>()

export const setAudioConvertVisibleMapEntry = (msgID: string, visible: boolean): void => {
  _audioConvertVisibleMap.set(msgID, visible)
}

export const deleteAudioConvertVisibleMapEntry = (msgID: string): void => {
  _audioConvertVisibleMap.delete(msgID)
}

export const getAudioConvertVisibleMap = (): Map<string, boolean> => {
  return _audioConvertVisibleMap
}

export const clearAudioConvertVisibleMap = (): void => {
  _audioConvertVisibleMap = new Map<string, boolean>()
}
