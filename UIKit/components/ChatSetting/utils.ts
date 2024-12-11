import TUIChatEngine from '@tencentcloud/chat-uikit-engine';

const isOwner = (role: string) => {
  return role === TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER;
};

const isAmin = (role: string) => {
  return role === TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN;
};

// Group owner and admin or the group which is work can update group basic profile(name、avatar、introduction、notification).
export const canIUpdateBasicProfile = (role: string, type: string) => {
  return isOwner(role) || isAmin(role) || type === TUIChatEngine.TYPES.GRP_WORK;
};

// Group owner and admin can update joinOptions for public and community.
export const canIUpdateJoinOptions = (role: string, type: string) => {
  if (isOwner(role) || isAmin(role)) {
    return type === TUIChatEngine.TYPES.GRP_PUBLIC || type === TUIChatEngine.TYPES.GRP_COMMUNITY;
  }
  return false;
};

// Group owner and admin can update inviteOptions other than avchatroom.
export const canIUpdateInviteOptions = (role: string, type: string) => {
  if (isOwner(role) || isAmin(role)) {
    return type !== TUIChatEngine.TYPES.GRP_AVCHATROOM;
  }
  return false;
};

// Work group who is App admin can dismiss group.
export const canIDismissGroup = (role: string, type: string) => {
  return isOwner(role) && type !== TUIChatEngine.TYPES.GRP_WORK;
};

// Member who is owner can leave from work group.
export const canILeaveGroup = (role: string, type: string) => {
  if (type === TUIChatEngine.TYPES.GRP_WORK) {
    return isOwner(role);
  }
  return !isOwner(role);
};

// Member who is owner can transfer owner and avchatroom is not supported.
export const canITransferOwner = (role: string, type: string) => {
  return isOwner(role) && type !== TUIChatEngine.TYPES.GRP_AVCHATROOM;
};

// Member who is owner can set admin and work is not supported.
export const canISetAdmin = (role: string, type: string) => {
  return isOwner(role) && type !== TUIChatEngine.TYPES.GRP_WORK;
};

// Member who is owner or admin can delete member.
export const canIDeleteMember = (role: string) => {
  return isOwner(role) || isAmin(role);
};
