import { getToday } from "./formatters";

export { getToday, dateLabel } from "./formatters";

export function weekStart(date: Date): Date {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
}

interface CalendarCell {
  date: Date | null;
  label: number;
  other: boolean;
  disabled: boolean;
}

export function getCalendarCells(year: number, month: number): CalendarCell[] {
  const today = getToday();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push({
      date: null,
      label: previousMonthDays - firstDay + index + 1,
      other: true,
      disabled: true,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    cells.push({
      date,
      label: day,
      other: false,
      disabled: date < today,
    });
  }

  return cells;
}
