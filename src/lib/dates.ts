function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function calendarDaysAgo(now: Date, date: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round(
    (startOfDay(now).getTime() - startOfDay(date).getTime()) / msPerDay,
  );
}

function monthsAgo(now: Date, date: Date): number {
  let months =
    (now.getFullYear() - date.getFullYear()) * 12 +
    (now.getMonth() - date.getMonth());
  if (now.getDate() < date.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

function yearsAgo(now: Date, date: Date): number {
  let years = now.getFullYear() - date.getFullYear();
  if (
    now.getMonth() < date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() < date.getDate())
  ) {
    years -= 1;
  }
  return Math.max(0, years);
}

export function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeDate(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const elapsedMs = now.getTime() - date.getTime();

  if (elapsedMs < 0) {
    return formatFullDate(iso);
  }

  const dayDiff = calendarDaysAgo(now, date);

  if (dayDiff === 0) {
    const hours = Math.floor(elapsedMs / (60 * 60 * 1000));
    if (hours < 1) {
      return "less than an hour ago";
    }
    if (hours === 1) {
      return "1 hour ago";
    }
    return `${hours} hours ago`;
  }

  if (dayDiff === 1) {
    return "yesterday";
  }

  if (dayDiff < 30) {
    return `${dayDiff} days ago`;
  }

  const years = yearsAgo(now, date);
  if (years >= 1) {
    return years === 1 ? "1 year ago" : `${years} years ago`;
  }

  const months = monthsAgo(now, date);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}
