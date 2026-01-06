/**
 * DatePicker Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Date selection with calendar dropdown
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from './Input';
import { IconCalendar, IconChevronLeft, IconChevronRight } from './icons';

export interface DatePickerProps {
  /** Selected date */
  value?: Date | null;
  /** Change handler */
  onChange?: (date: Date | null) => void;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Disabled state */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Label */
  label?: string;
  /** Placeholder */
  placeholder?: string;
  /** Date format (default: MM/DD/YYYY) */
  dateFormat?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  /** Full width */
  fullWidth?: boolean;
}

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  error = false,
  errorMessage,
  label,
  placeholder = 'Select date',
  dateFormat = 'MM/DD/YYYY',
  fullWidth = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return '';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    switch (dateFormat) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'MM/DD/YYYY':
      default:
        return `${month}/${day}/${year}`;
    }
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const handleDateSelect = (date: Date) => {
    if (!isDateDisabled(date)) {
      onChange?.(date);
      setIsOpen(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getDaysInMonth = (): Date[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add empty cells for days before month starts
    const startDay = firstDay.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(new Date(year, month, -startDay + i + 1));
    }

    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calendar styles
  const calendarStyles: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 'var(--space-2)',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    padding: 'var(--space-4)',
    zIndex: 1000,
    minWidth: '280px',
    fontFamily: 'var(--font-family-sans)',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-4)',
  };

  const monthYearStyles: React.CSSProperties = {
    fontSize: 'var(--text-body-size)',
    fontWeight: 600,
    color: 'var(--color-gray-900)',
  };

  const navButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 'var(--space-2)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease',
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 'var(--space-1)',
  };

  const dayHeaderStyles: React.CSSProperties = {
    fontSize: 'var(--text-micro-size)',
    fontWeight: 600,
    color: 'var(--color-gray-600)',
    textAlign: 'center',
    padding: 'var(--space-2)',
  };

  const getDayStyles = (date: Date, isCurrentMonth: boolean): React.CSSProperties => {
    const isSelected = value && isSameDay(date, value);
    const isToday = isSameDay(date, new Date());
    const isDisabled = isDateDisabled(date);

    return {
      fontSize: 'var(--text-caption-size)',
      padding: 'var(--space-2)',
      textAlign: 'center',
      borderRadius: 'var(--radius-md)',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
      color: isSelected
        ? '#FFFFFF'
        : !isCurrentMonth
          ? 'var(--color-gray-300)'
          : isDisabled
            ? 'var(--color-gray-400)'
            : 'var(--color-gray-900)',
      fontWeight: isToday && !isSelected ? 600 : 400,
      border: isToday && !isSelected ? '1px solid var(--color-primary)' : '1px solid transparent',
      transition: 'all 0.2s ease',
      opacity: isDisabled ? 0.5 : 1,
    };
  };

  const days = getDaysInMonth();
  const currentMonthNumber = currentMonth.getMonth();

  return (
    <div ref={containerRef} style={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      <Input
        label={label}
        value={formatDate(value)}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        errorMessage={errorMessage}
        fullWidth={fullWidth}
        readOnly
        onClick={() => !disabled && setIsOpen(!isOpen)}
        iconPosition="right"
        rightIcon={<IconCalendar size={20} color="var(--color-gray-500)" />}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      />

      {isOpen && (
        <div ref={calendarRef} style={calendarStyles}>
          {/* Header */}
          <div style={headerStyles}>
            <button
              onClick={handlePreviousMonth}
              style={navButtonStyles}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-gray-100)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <IconChevronLeft size={20} color="var(--color-gray-600)" />
            </button>

            <div style={monthYearStyles}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>

            <button
              onClick={handleNextMonth}
              style={navButtonStyles}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-gray-100)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <IconChevronRight size={20} color="var(--color-gray-600)" />
            </button>
          </div>

          {/* Day headers */}
          <div style={gridStyles}>
            {dayNames.map((day) => (
              <div key={day} style={dayHeaderStyles}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={gridStyles}>
            {days.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentMonthNumber;
              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  style={getDayStyles(date, isCurrentMonth)}
                  disabled={isDateDisabled(date)}
                  onMouseEnter={(e) => {
                    if (!isDateDisabled(date) && !(value && isSameDay(date, value))) {
                      e.currentTarget.style.backgroundColor = 'var(--color-gray-100)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(value && isSameDay(date, value))) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
