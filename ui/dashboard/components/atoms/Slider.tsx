import React, { useState, useRef, useEffect } from 'react';

export interface SliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  showValue?: boolean;
  showMarks?: boolean;
  marks?: { value: number; label: string }[];
  color?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

export function Slider({
  value: controlledValue,
  defaultValue = 50,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
  showValue = false,
  showMarks = false,
  marks = [],
  color = 'primary',
  className = '',
}: SliderProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const colorMap = {
    primary: 'var(--color-primary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-error)',
  };

  const trackColor = colorMap[color];
  const percentage = ((value - min) / (max - min)) * 100;

  const updateValue = (clientX: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, offsetX / rect.width));
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    if (controlledValue === undefined) {
      setInternalValue(clampedValue);
    }
    onChange?.(clampedValue);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    updateValue(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || disabled) return;
    updateValue(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    padding: showMarks ? 'var(--space-6) 0' : 'var(--space-3) 0',
    opacity: disabled ? 0.5 : 1,
  };

  const trackStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '6px',
    backgroundColor: 'var(--color-gray-200)',
    borderRadius: '3px',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const fillStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${percentage}%`,
    backgroundColor: trackColor,
    borderRadius: '3px',
    transition: isDragging ? 'none' : 'width 0.1s ease',
  };

  const thumbStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: `${percentage}%`,
    transform: 'translate(-50%, -50%)',
    width: '20px',
    height: '20px',
    backgroundColor: '#FFFFFF',
    border: `3px solid ${trackColor}`,
    borderRadius: '50%',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    cursor: disabled ? 'not-allowed' : 'grab',
    transition: isDragging ? 'none' : 'left 0.1s ease',
  };

  const valueDisplayStyles: React.CSSProperties = {
    position: 'absolute',
    top: '-28px',
    left: `${percentage}%`,
    transform: 'translateX(-50%)',
    fontSize: 'var(--text-caption-size)',
    fontWeight: 600,
    color: trackColor,
    backgroundColor: '#FFFFFF',
    padding: 'var(--space-1) var(--space-2)',
    borderRadius: 'var(--radius-sm)',
    border: `1px solid ${trackColor}`,
    whiteSpace: 'nowrap',
  };

  const marksContainerStyles: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    width: '100%',
    marginTop: 'var(--space-2)',
  };

  const markStyles = (markValue: number): React.CSSProperties => {
    const markPercentage = ((markValue - min) / (max - min)) * 100;
    return {
      position: 'absolute',
      left: `${markPercentage}%`,
      transform: 'translateX(-50%)',
      fontSize: 'var(--text-caption-size)',
      color: 'var(--color-gray-600)',
      whiteSpace: 'nowrap',
    };
  };

  const defaultMarks = showMarks && marks.length === 0
    ? [
        { value: min, label: String(min) },
        { value: max, label: String(max) },
      ]
    : marks;

  return (
    <div className={className} style={containerStyles}>
      <div
        ref={sliderRef}
        style={trackStyles}
        onMouseDown={handleMouseDown}
      >
        <div style={fillStyles} />
        <div style={thumbStyles} />
        {showValue && (
          <div style={valueDisplayStyles}>
            {value}
          </div>
        )}
      </div>
      {showMarks && defaultMarks.length > 0 && (
        <div style={marksContainerStyles}>
          {defaultMarks.map((mark) => (
            <div key={mark.value} style={markStyles(mark.value)}>
              {mark.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Slider;
