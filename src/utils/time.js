const PHT = 'Asia/Manila';

export function formatTimePHT(isoString) {
  try {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-PH', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: PHT,
    }).format(date);
  } catch {
    return '';
  }
}

export function getDateStringPHT(isoString) {
  try {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: PHT,
    }).format(date);
  } catch {
    return '';
  }
}

export function isTodayPHT(isoString) {
  const gameDate = getDateStringPHT(isoString);
  if (!gameDate) return false;
  const now = new Date();
  const today = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: PHT,
  }).format(now);
  return gameDate === today;
}

export function formatDateLabelPHT(isoString) {
  try {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '';
    const gameDate = getDateStringPHT(isoString);
    const today = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: PHT,
    }).format(new Date());
    const tomorrow = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: PHT,
    }).format(new Date(Date.now() + 86400000));
    if (gameDate === today) {
      const short = new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        timeZone: PHT,
      }).format(date);
      return `Today, ${short}`;
    }
    if (gameDate === tomorrow) {
      const short = new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        timeZone: PHT,
      }).format(date);
      return `Tomorrow, ${short}`;
    }
    return new Intl.DateTimeFormat('en-PH', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: PHT,
    }).format(date);
  } catch {
    return '';
  }
}
