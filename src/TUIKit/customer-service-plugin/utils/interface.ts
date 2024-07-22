export interface customerServicePayloadType {
  chatbotPlugin?: number | string;
  customerServicePlugin?: number | string;
  src: string;
  content: any;
  subtype?: string;
  menuContent?: ratingTemplateType
}

interface IMenuItem {
  content: string;
  id: string;
}

export interface ratingTemplateType {
  allowClientSendRating: boolean;
  effectiveHour: number;
  head: string;
  tail: string;
  type: number;
  menu: IMenuItem[];
  expireTime: number;
  selected?: IMenuItem;
  sessionId?: string;
}

export interface TextMessagePayload {
  text: string;
}

export interface CustomMessagePayload {
  data: string;
  description: string;
  extension: string;
}

