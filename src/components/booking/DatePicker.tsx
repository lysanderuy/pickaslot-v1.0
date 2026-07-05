"use client";

import { cx } from "@/lib/cx";
import { tw } from "@/lib/ui/tokens";
import { sameDay } from "@/lib/date/sameDay";
import { getWeekNumber } from "@/lib/date/weekNumber";
import { DAYS, DAYS_SHORT, MONTHS } from "@/lib/date/constants";
import { getToday, dateLabel } from "@/lib/date/formatters";
import { toDateKey } from "@/lib/date/toDateKey";
import { useMemo } from "react";
import { useBooking } from "@/contexts/BookingContext";

function weekStart(date: Date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
}

function getCalendarCells(year: number, month: number, timeZone: string) {
  const today = getToday(timeZone);
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const cells: Array<{ date: Date | null; label: number; other: boolean; disabled: boolean }> = [];

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

export function DatePicker() {
  const {
    timeZone,
    selectedDate,
    calendarMonth,
    setCalendarMonth,
    calendarOpen,
    setCalendarOpen,
    setSelectedDate,
  } = useBooking();

  const calendarCells = useMemo(
    () => getCalendarCells(calendarMonth.year, calendarMonth.month, timeZone),
    [calendarMonth.year, calendarMonth.month, timeZone]
  );

  function onCalendarToggle() {
    setCalendarMonth({ year: selectedDate.getFullYear(), month: selectedDate.getMonth() });
    setCalendarOpen((current) => !current);
  }

  function onShiftMonth(delta: number) {
    setCalendarMonth((current) => {
      const date = new Date(current.year, current.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  function onPickDate(date: Date) {
    setSelectedDate(date);
    setCalendarOpen(false);
  }

  return (
    <section className="pt-6">
      <div className={`${tw.sectionLabel} mb-3`}>
        Pick a Date
      </div>
      <button
        type="button"
        className={cx(
          "flex w-full items-center justify-between gap-3 border bg-[#162E20] px-4 py-3.5 text-left transition",
          calendarOpen ? "rounded-t-[14px] border-[#4ADE80] border-b-transparent" : "rounded-[14px] border-[#2A4A35]"
        )}
        onClick={onCalendarToggle}
      >
        <span className="flex items-center gap-3">
          <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] border border-[rgba(74,222,128,0.15)] bg-[rgba(74,222,128,0.12)] text-[#4ADE80]">
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="2" y="3" width="14" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 7h14" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 1v3M12 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <span>
            <span className="block text-sm font-bold leading-none tracking-[-0.01em] text-[#F0F7F2] sm:text-base">
              {dateLabel(selectedDate, timeZone)}
            </span>
            <span className="mt-[3px] block text-[11px] font-medium text-[#8AAF95]">
              {DAYS[selectedDate.getDay()]} · Week {getWeekNumber(selectedDate)}
            </span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <span className="hidden text-[11px] font-bold uppercase tracking-[0.05em] text-[#4ADE80] min-[380px]:inline">
            Change
          </span>
          <span
            className={cx(
              "flex h-[22px] w-[22px] items-center justify-center rounded-md bg-[rgba(74,222,128,0.12)] text-[#4ADE80] transition",
              calendarOpen && "rotate-180"
            )}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
      </button>

      <div
        className={cx(
          "overflow-hidden rounded-b-[14px] border-x border-b border-[#4ADE80] bg-[#162E20] transition-[max-height]",
          calendarOpen ? "max-h-80" : "max-h-0 border-transparent"
        )}
      >
        <div className="px-4 pb-4 pt-3.5">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              className="h-7 w-7 rounded-md border border-[#2A4A35] bg-[#1C3828] text-[#8AAF95]"
              onClick={() => onShiftMonth(-1)}
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#F0F7F2]">
              {MONTHS[calendarMonth.month]} {calendarMonth.year}
            </span>
            <button
              type="button"
              className="h-7 w-7 rounded-md border border-[#2A4A35] bg-[#1C3828] text-[#8AAF95]"
              onClick={() => onShiftMonth(1)}
              aria-label="Next month"
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-[3px]">
            {DAYS_SHORT.map((day) => (
              <div
                key={day}
                className="pb-1.5 text-center text-[9px] font-bold uppercase tracking-[0.08em] text-[#4A6B55]"
              >
                {day[0]}
              </div>
            ))}
            {calendarCells.map((cell, index) => {
              const isSelected = cell.date ? sameDay(cell.date, selectedDate) : false;
              const isToday = cell.date ? sameDay(cell.date, getToday(timeZone)) : false;

              return (
                <button
                  key={`${cell.label}-${index}`}
                  type="button"
                  className={cx(
                    "flex h-8 w-full items-center justify-center rounded-md border-0 bg-transparent text-[13px] font-medium transition enabled:hover:bg-[#1C3828]",
                    isToday && "font-extrabold text-[#4ADE80]",
                    isSelected && "bg-[#4ADE80] font-bold text-[#0F2418] hover:bg-[#4ADE80]",
                    (cell.other || cell.disabled) && !isSelected && "text-[#2E4D38]"
                  )}
                  disabled={!cell.date || cell.disabled}
                  onClick={() => cell.date && onPickDate(cell.date)}
                >
                  {cell.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-1.5 grid grid-cols-7 gap-[5px]">
        {Array.from({ length: 7 }, (_, index) => {
          const start = weekStart(selectedDate);
          const day = new Date(start);
          day.setDate(start.getDate() + index);
          const today = getToday(timeZone);
          const disabled = day < today;
          const active = sameDay(day, selectedDate);
          const isToday = sameDay(day, today);

          return (
            <button
              key={toDateKey(day)}
              type="button"
              className={cx(
                "flex flex-col items-center gap-0.5 rounded-[10px] border px-0.5 py-1.5 transition active:scale-95 sm:gap-1 sm:px-1 sm:py-2",
                active
                  ? "border-[#4ADE80] bg-[#4ADE80] shadow-[0_3px_14px_rgba(74,222,128,0.25)]"
                  : "border-[#2A4A35] bg-[#162E20]",
                isToday && !active && "border-[rgba(74,222,128,0.3)]",
                disabled && "cursor-default opacity-30"
              )}
              disabled={disabled}
              onClick={() => onPickDate(day)}
            >
              <span
                className={cx(
                  "text-[9px] font-bold uppercase tracking-[0.08em] leading-none",
                  active
                    ? "text-[rgba(15,36,24,0.65)]"
                    : isToday
                    ? "text-[#4ADE80]"
                    : "text-[#4A6B55]"
                )}
              >
                {DAYS_SHORT[day.getDay()]}
              </span>
              <span
                className={cx(
                  "text-sm font-bold leading-none sm:text-base",
                  active ? "text-[#0F2418]" : isToday ? "text-[#4ADE80]" : "text-[#8AAF95]"
                )}
              >
                {day.getDate()}
              </span>
              <span
                className={cx(
                  "h-1 w-1 rounded-full",
                  active ? "bg-[rgba(15,36,24,0.3)]" : !disabled ? "bg-[#2A4A35]" : "bg-transparent"
                )}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
