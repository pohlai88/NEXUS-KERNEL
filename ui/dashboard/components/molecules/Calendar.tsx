import React, { useState, useMemo } from 'react';
import { IconChevronLeft, IconChevronRight } from '../atoms/icons';

export interface CalendarProps {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  highlightedDates?: Date[];
  showWeekNumbers?: boolean;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  disabled?: boolean;
  className?: string;
}

export function Calendar({
  value: controlledValue,
  defaultValue,
  onChange,
  minDate,
  maxDate,
  disabledDates = [],
  highlightedDates = [],
  showWeekNumbers = false,
  firstDayOfWeek = 0,
  disabled = false,
  className = '',
}: CalendarProps) {
  const [internalValue, setInternalValue] = useState<Date | null>(defaultValue || null);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    controlledValue || defaultValue || new Date()
  );

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const isSameDay = (date1: Date | null, date2: Date | null): boolean => {
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return disabledDates.some((d) => isSameDay(d, date));
  };

  const isDateHighlighted = (date: Date): boolean => {
    return highlightedDates.some((d) => isSameDay(d, date));
  };

  const getCalendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Calculate offset based on firstDayOfWeek
    const offset = (startingDayOfWeek - firstDayOfWeek + 7) % 7;

    // Add empty cells for days before the month starts
    for (let i = 0; i < offset; i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    // Fill remaining cells to complete the week
    const remainingCells = 7 - (days.length % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        days.push(null);
      }
    }

    return days;
  }, [currentMonth, firstDayOfWeek]);

  const weeks = useMemo(() => {
    const result: (Date | null)[][] = [];
    for (let i = 0; i < getCalendarDays.length; i += 7) {
      result.push(getCalendarDays.slice(i, i + 7));
    }
    return result;
  }, [getCalendarDays]);

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const handleDateClick = (date: Date) => {
    if (disabled || isDateDisabled(date)) return;

    if (controlledValue === undefined) {
      setInternalValue(date);
    }
    onChange?.(date);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleMonthChange = (month: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), month, 1));
  };

  const handleYearChange = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
  };

  const containerStyles: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-4)',
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'var(--space-4)',
    gap: 'var(--space-3)',
  };

  const navigationButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    backgroundColor: 'transparent',
    border: '1px solid var(--color-gray-300)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };

  const selectorsContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--space-2)',
  };

  const selectStyles: React.CSSProperties = {
    padding: 'var(--space-2) var(--space-3)',
    fontSize: 'var(--text-body-size)',
    fontWeight: 600,
    color: 'var(--color-gray-900)',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-gray-300)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    outline: 'none',
  };

  const tableStyles: React.CSSProperties = {
    borderCollapse: 'collapse',
    width: '100%',
  };

  const theadStyles: React.CSSProperties = {
    borderBottom: '1px solid var(--color-gray-200)',
  };

  const dayHeaderStyles: React.CSSProperties = {
    padding: 'var(--space-2)',
    fontSize: 'var(--text-caption-size)',
    fontWeight: 600,
    color: 'var(--color-gray-600)',
    textAlign: 'center',
  };

  const weekNumberCellStyles: React.CSSProperties = {
    padding: 'var(--space-2)',
    fontSize: 'var(--text-caption-size)',
    color: 'var(--color-gray-400)',
    textAlign: 'center',
    borderRight: '1px solid var(--color-gray-200)',
  };

  const dayCellStyles = (
    date: Date | null,
    isSelected: boolean,
    isToday: boolean,
    isDisabled: boolean,
    isHighlighted: boolean
  ): React.CSSProperties => ({
    padding: 'var(--space-2)',
    textAlign: 'center',
    cursor: date && !isDisabled ? 'pointer' : 'default',
  });

  const dayButtonStyles = (
    isSelected: boolean,
    isToday: boolean,
    isDisabled: boolean,
    isHighlighted: boolean
  ): React.CSSProperties => ({
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    fontSize: 'var(--text-body-size)',
    fontWeight: isSelected || isToday ? 600 : 400,
    color: isSelected
      ? '#FFFFFF'
      : isDisabled
      ? 'var(--color-gray-400)'
      : isToday
      ? 'var(--color-primary)'
      : 'var(--color-gray-900)',
    backgroundColor: isSelected
      ? 'var(--color-primary)'
      : isHighlighted
      ? 'var(--color-warning-50)'
      : 'transparent',
    border: isToday && !isSelected ? '2px solid var(--color-primary)' : 'none',
    borderRadius: '50%',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    transition: 'all 0.15s ease',
  });

  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();
  const today = new Date();

  // Adjust day headers based on firstDayOfWeek
  const adjustedDays = [...DAYS.slice(firstDayOfWeek), ...DAYS.slice(0, firstDayOfWeek)];

  return (
    <div className={className} style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <button
          onClick={handlePreviousMonth}
          style={navigationButtonStyles}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <IconChevronLeft size={16} />
        </button>

        <div style={selectorsContainerStyles}>
          <select
            value={currentMonthIndex}
            onChange={(e) => handleMonthChange(Number(e.target.value))}
            style={selectStyles}
          >
            {MONTHS.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={currentYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            style={selectStyles}
          >
            {Array.from({ length: 21 }, (_, i) => currentYear - 10 + i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleNextMonth}
          style={navigationButtonStyles}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <IconChevronRight size={16} />
        </button>
      </div>

      {/* Calendar Grid */}
      <table style={tableStyles}>
        <thead style={theadStyles}>
          <tr>
            {showWeekNumbers && <th style={dayHeaderStyles}>W</th>}
            {adjustedDays.map((day) => (
              <th key={day} style={dayHeaderStyles}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {showWeekNumbers && week[0] && (
                <td style={weekNumberCellStyles}>{getWeekNumber(week[0])}</td>
              )}
              {week.map((date, dayIndex) => {
                if (!date) {
                  return <td key={dayIndex} style={dayCellStyles(null, false, false, false, false)} />;
                }

                const isSelected = isSameDay(date, value);
                const isToday = isSameDay(date, today);
                const isDisabled = isDateDisabled(date);
                const isHighlighted = isDateHighlighted(date);

                return (
                  <td key={dayIndex} style={dayCellStyles(date, isSelected, isToday, isDisabled, isHighlighted)}>
                    <div
                      style={dayButtonStyles(isSelected, isToday, isDisabled, isHighlighted)}
                      onClick={() => handleDateClick(date)}
                      onMouseEnter={(e) => {
                        if (!isDisabled && !isSelected) {
                          e.currentTarget.style.backgroundColor = 'var(--color-gray-100)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = isHighlighted ? 'var(--color-warning-50)' : 'transparent';
                        }
                      }}
                    >
                      {date.getDate()}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Calendar;
