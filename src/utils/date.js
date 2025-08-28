export function formatDateToLocal(date) {
  if (date) {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  }
  return "N/A";
}

export function formatDate(date) {
  if (!date) return "N/A";
  // Match YYYY-MM-DD from ISO string
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return "N/A";
  const [, year, month, day] = match;
  return `${month}/${day}/${year}`;
}

export function formatDateMMDDYY(date) {
  if (!date) return "N/A";
  // Match YYYY-MM-DD from ISO string
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return "N/A";
  const [, year, month, day] = match;
  const shortDate = year.slice(-2);
  return `${month}/${day}/${shortDate}`;
}

export function convertUTCToESTTime(utcDateStr) {
  if (!utcDateStr) return "N/A";
  const date = new Date(utcDateStr);
  const estTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
  return estTime;
}

export function convertUTCtoEST(utcString) {
  if (!utcString) return "";

  // Ensure it's in ISO format (add "Z" = UTC if missing)
  const isoString = utcString.endsWith("Z")
    ? utcString
    : utcString.replace(" ", "T") + "Z";
  const date = new Date(isoString);

  // Format to US Eastern time (handles EST/EDT automatically)
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export function convertToMMDDYYYY(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return "";
  const [year, month, day] = dateStr.split("-");
  return `${month}-${day}-${year}`;
}

export function getLastDayOfMonth(dateString) {
  if (!dateString) return "";
  const [month, date, year] = dateString.split("-").map(Number);

  if (!year || !month) return "";
  const lastDay = new Date(year, month, 0);

  const yyyy = lastDay.getFullYear();
  const mm = String(lastDay.getMonth() + 1).padStart(2, "0");
  const dd = String(lastDay.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function toYYYYMMDD(dateStr) {
  if (!dateStr) return "";

  let date = new Date(dateStr);

  if (isNaN(date)) {
    const parts = dateStr.split(/[-\/]/);
    if (parts.length === 3) {
      let [p1, p2, p3] = parts.map(Number);
      if (p1 > 999) {
        date = new Date(p1, p2 - 1, p3);
      } else if (p3 > 999) {
        if (p1 > 12) {
          date = new Date(p3, p2 - 1, p1);
        } else {
          date = new Date(p3, p1 - 1, p2);
        }
      }
    } else if (parts.length === 2) {
      let [month, year] = parts.map(Number);
      if (year < 100) year += 2000;
      date = new Date(year, month, 0);
    } else {
      return "";
    }
  }

  if (isNaN(date)) return "";

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const formatDateTime = (dateString) => {
  try {
    // Fallback for loading/invalid values
    if (!dateString || dateString === "Loading..." || dateString === "N/A") {
      return dateString || "N/A";
    }
    // You can use Date parsing for most cases
    const dateObj = new Date(dateString);
    if (!isNaN(dateObj)) {
      const dd = String(dateObj.getDate()).padStart(2, "0");
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const yyyy = dateObj.getFullYear();
      const hh = String(dateObj.getHours()).padStart(2, "0");
      const min = String(dateObj.getMinutes()).padStart(2, "0");
      const ss = String(dateObj.getSeconds()).padStart(2, "0");
      return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
    }
    return "Invalid Date";
  } catch (error) {
    console.error("Invalid date format:", error);
    return "Invalid Date";
  }
};

export const formatTodayDateOnly = () => {
  try {
    const dateObj = new Date();
    if (!isNaN(dateObj)) {
      const dd = String(dateObj.getDate()).padStart(2, "0");
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const yyyy = dateObj.getFullYear();
      return `${mm}-${dd}-${yyyy}`;
    }
    return "Invalid Date";
  } catch (error) {
    console.error("Invalid date format:", error);
    return "Invalid Date";
  }
};
