//@ts-nocheck
const generateMonths = (startDate: Date) => {
  const months = [];

  const formatDate = (year: number, month: number, day: number): string =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  for (let i = 0; i < 36; i++) {
    const currentDate = new Date(startDate);
    currentDate.setMonth(startDate.getMonth() + i, 1);
    const year = currentDate.getFullYear();
    const monthIdx = currentDate.getMonth();

    const firstDay = currentDate.getDay();
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

    // Previous month days
    const prevMonthDays = new Date(year, monthIdx, 0).getDate();
    const prevDays = Array.from({ length: firstDay }, (_, i) => {
      const day = prevMonthDays - firstDay + i + 1;
      return {
        day,
        isCurrentMonth: false,
        dateString: formatDate(
          year - (monthIdx === 0 ? 1 : 0),
          (monthIdx + 11) % 12,
          day,
        ),
      };
    });

    // Current month days
    const currentDays = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      isCurrentMonth: true,
      dateString: formatDate(year, monthIdx, i + 1),
    }));

    // Next month days
    const totalDays = prevDays.length + currentDays.length;
    const nextDaysCount = (7 - (totalDays % 7)) % 7;
    const nextDays = Array.from({ length: nextDaysCount }, (_, i) => ({
      day: i + 1,
      isCurrentMonth: false,
      dateString: formatDate(
        year + (monthIdx === 11 ? 1 : 0),
        (monthIdx + 1) % 12,
        i + 1,
      ),
    }));

    // Combine and split into weeks
    const weeks = [];
    const allDays = [...prevDays, ...currentDays, ...nextDays];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

 
    months.push({
      year,
      month: monthIdx,
      weeks,
      monthName: currentDate.toLocaleString("default", { month: "long" }),
    });
  }
  return months;
};

function getDateRange(monthYear?: string): { start: Date; end: Date } {
  let year: number, month: number;

  if (monthYear) {
    const [monthName, yearStr] = monthYear.split(" ");
    year = parseInt(yearStr as string, 10);
    month = new Date(`${monthName} 1, ${year}`).getMonth() + 1;

    if (isNaN(year) || month < 1 || month > 12) {
      throw new Error(
        "Invalid month-year format. Use 'Month YYYY' (e.g., 'February 2025').",
      );
    }
  } else {
    const currentDate = new Date();
    year = currentDate.getUTCFullYear();
    month = currentDate.getUTCMonth() + 1;
  }

  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0)); // First day of the month at midnight UTC
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59)); // Last day of the month at 23:59:59 UTC

  return { start, end };
}

function convertToUTC(dateStr: string | Date | undefined) {
  // Create a Date object in UTC without timezone shift
  const date = new Date(dateStr + "T00:00:00.000Z");

  // Get the local timezone format dynamically
  const localTimezone = new Date().toString().match(/\(.*\)$/)?.[0] || "(UTC)";

  // Manually format the date to match `toString()` output but in UTC
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const day = days[date.getUTCDay()];
  const month = months[date.getUTCMonth()];
  const dayNum = String(date.getUTCDate()).padStart(2, "0");
  const year = date.getUTCFullYear();
  const time = "01:00:00"; // Since we set UTC midnight

  // Get the timezone offset in the same format as `toString()`
  const offsetMinutes = new Date().getTimezoneOffset();
  const offsetHours = Math.abs(offsetMinutes) / 60;
  const offsetSign = offsetMinutes > 0 ? "-" : "+";
  const formattedOffset = `GMT${offsetSign}${String(offsetHours).padStart(2, "0")}00`;

  return `${day} ${month} ${dayNum} ${year} ${time} ${formattedOffset} ${localTimezone}`;
}

export { convertToUTC, generateMonths, getDateRange };
