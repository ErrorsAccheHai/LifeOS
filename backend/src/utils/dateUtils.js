/**
 * Timezone-aware date utilities
 * Ensures consistent date handling across the app
 */

/**
 * Get today's date string in user's timezone
 * @param {string} timezone - User's timezone (e.g., 'Asia/Kolkata', 'UTC')
 * @returns {string} Date in YYYY-MM-DD format
 */
const getTodayDateString = (timezone = 'UTC') => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
};

/**
 * Get date N days from now in user's timezone
 * @param {number} daysOffset - Days to offset (negative for past)
 * @param {string} timezone - User's timezone
 * @returns {string} Date in YYYY-MM-DD format
 */
const getDateStringOffset = (daysOffset = 0, timezone = 'UTC') => {
  const now = new Date();
  const localDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  const [year, month, day] = localDate.split('-');
  const date = new Date(year, month - 1, parseInt(day) + daysOffset);
  
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
};

/**
 * Convert date string to start of day (00:00:00) in user's timezone
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {string} timezone - User's timezone
 * @returns {Date} JavaScript Date object at start of day
 */
const getStartOfDay = (dateStr, timezone = 'UTC') => {
  const [year, month, day] = dateStr.split('-');
  const baseDate = new Date(year, month - 1, day);
  
  // Get UTC offset for the timezone on this specific date
  const utcFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  const localDateStr = utcFormatter.format(baseDate);
  const [localYear, localMonth, localDay] = localDateStr.split('-');
  
  // Adjust to match the local date
  baseDate.setFullYear(localYear, localMonth - 1, localDay);
  return baseDate;
};

/**
 * Get midnight UTC for a given date in user's timezone
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {Date} JavaScript Date object at midnight UTC
 */
const getEndOfDay = (dateStr) => {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, parseInt(day) + 1);
  date.setHours(0, 0, 0, 0);
  return date;
};

module.exports = {
  getTodayDateString,
  getDateStringOffset,
  getStartOfDay,
  getEndOfDay,
};
