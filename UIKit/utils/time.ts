import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';

const weekdayMap: Record<string, string> = {
  Sunday: 'Common.SUNDAY',
  Monday: 'Common.MONDAY',
  Tuesday: 'Common.TUESDAY',
  Wednesday: 'Common.WEDNESDAY',
  Thursday: 'Common.THURSDAY',
  Friday: 'Common.FRIDAY',
  Saturday: 'Common.SATURDAY',
};

// format: 12|24, default 24
// scence: 'CONV'|'MSG'|'TIMELINE'|, default 'MSG'
// output:
// HH:mm
// today / 星期几 / MM/DD / MM/DD/YYYY
// HH:mm / 星期几 / MM/DD / MM/DD/YYYY
export const formatTime = (timestamp: number, scence = 'MSG', format = 24) => {
  if (!timestamp) {
    return '';
  }
  const date = new Date(timestamp);
  const now = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  if (format === 12) {
    hours = hours % 12;
    hours = hours ? hours : 12;
  }

  const time = `${hours.toString().padStart(2, '0')}:${minutes}`;
  if (scence === 'MSG') {
    return format === 12 ? `${time} ${ampm}` : time;
  }

  if (isSameDay(timestamp, now.getTime())) {
    if (scence === 'TIMELINE') {
      return TUITranslateService.t('Common.TODAY');
    }
    return format === 12 ? `${time} ${ampm}` : time;
  }

  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekday = weekdays[date.getDay()];
  if (date >= weekStart && date <= weekEnd) {
    return `${TUITranslateService.t(weekdayMap[weekday])}`;
  }

  return now.getFullYear() === year ? `${month}/${day}` : `${month}/${day}/${year}`;
};

export const isSameDay = (timestamp: number, timestamp2: number) => {
  const date1 = new Date(timestamp);
  const date2 = new Date(timestamp2);
  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);
  return date1.getTime() === date2.getTime();
};
