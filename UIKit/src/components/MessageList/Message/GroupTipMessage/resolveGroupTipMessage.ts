
import { type MessageInfo, type MessageSenderInfo } from '../MessageTypes'

type TFunc = (key: string, opts?: Record<string, string | number>) => string

const memberName = (m?: MessageSenderInfo | null): string => {
  if (!m) return ''
  return m.nameCard || m.friendRemark || m.nickname || m.userID || ''
}

const membersName = (list?: MessageSenderInfo[] | null): string => {
  if (!list || list.length === 0) return ''
  return list.map(memberName).filter(Boolean).join('、')
}

const approvalOptionText = (value: any, t: TFunc): string => {
  if (value === 2 || value === 'ANY') return t('chatSetting.joinOptionAny', { defaultValue: '自由加入' })
  if (value === 1 || value === 'AUTH') return t('chatSetting.joinOptionAuth', { defaultValue: '需要审批' })
  return t('chatSetting.joinOptionForbidden', { defaultValue: '禁止加入' })
}

const formatMuteDuration = (seconds: number, t: TFunc): string => {
  if (!seconds || seconds <= 0) return ''
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return m > 0 ? `${h}${t('chatSetting.muteHour', { defaultValue: '小时' })}${m}${t('chatSetting.muteMinute', { defaultValue: '分钟' })}` : `${h}${t('chatSetting.muteHour', { defaultValue: '小时' })}`
  if (m > 0) return s > 0 ? `${m}${t('chatSetting.muteMinute', { defaultValue: '分钟' })}${s}${t('chatSetting.muteSecond', { defaultValue: '秒' })}` : `${m}${t('chatSetting.muteMinute', { defaultValue: '分钟' })}`
  return `${s}${t('chatSetting.muteSecond', { defaultValue: '秒' })}`
}

export const resolveGroupTipMessage = (message: MessageInfo, t: TFunc): string => {
  const groupTips: any[] = (message.messagePayload as any)?.groupTips || []
  if (groupTips.length === 0) {
    return t('groupTip.system')
  }

  const tip: any = groupTips[0]
  const tipType: string = tip?.type || tip?._type

  const opName = memberName(tip.opUser)

  switch (tipType) {
    case 'JoinGroup':
      return t('groupTip.memberEntered', { name: memberName(tip.joinMember) })

    case 'InviteToGroup':
      return t('groupTip.inviteToGroup', { operator: memberName(tip.inviter), invitees: membersName(tip.invitees) })

    case 'QuitGroup':
      return t('groupTip.memberLeft', { name: memberName(tip.quitMember) })

    case 'KickedFromGroup':
      return t('groupTip.memberKickedBy', { name: membersName(tip.kickedMembers), operator: opName })

    case 'SetGroupAdmin':
      return t('groupTip.setAdmin', { operator: opName, name: membersName(tip.setAdminMembers) })

    case 'CancelGroupAdmin':
      return t('groupTip.cancelAdmin', { operator: opName, name: membersName(tip.cancelAdminMembers) })

    case 'ChangeGroupName':
      return t('groupTip.groupNameChanged', { operator: opName })

    case 'ChangeGroupAvatar':
      return t('groupTip.changeAvatar', { operator: opName })

    case 'ChangeGroupNotification':
      return t('groupTip.groupNoticeChanged', { operator: opName })

    case 'ChangeGroupIntroduction':
      return t('groupTip.changeIntroduction', { operator: opName })

    case 'ChangeGroupOwner':
      return t('groupTip.ownerTransferred', { operator: opName, name: tip.groupOwner ?? '' })

    case 'ChangeGroupMuteAll':
      return tip.isMuteAll
        ? t('groupTip.muteGroup', { operator: opName })
        : t('groupTip.unmuteGroup', { operator: opName })

    case 'ChangeJoinGroupApproval':
      return t('groupTip.changeJoinApproval', {
        operator: opName,
        option: approvalOptionText(tip.groupJoinOption, t),
      })

    case 'ChangeInviteToGroupApproval':
      return t('groupTip.changeInviteApproval', {
        operator: opName,
        option: approvalOptionText(tip.groupInviteOption, t),
      })

    case 'MuteGroupMember': {
      const target = tip.isSelfMuted ? t('common.you', { defaultValue: '你' }) : membersName(tip.mutedGroupMembers)
      if (!target) return t('groupTip.system')
      const duration = formatMuteDuration(Number(tip.muteTime) || 0, t)
      return duration
        ? t('groupTip.muteMember', { operator: opName, name: target, duration })
        : t('groupTip.unmuteMember', { operator: opName, name: target })
    }

    case 'PinGroupMessage':
      return t('groupTip.pinMessage', { operator: opName })

    case 'UnpinGroupMessage':
      return t('groupTip.unpinMessage', { operator: opName })

    case 'Unknown':
    default:
      return t('groupTip.system')
  }
}
