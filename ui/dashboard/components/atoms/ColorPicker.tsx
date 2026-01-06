import React, { useState, useRef } from 'react';

export interface ColorPickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (color: { hex: string; rgb: string; hsl: string }) => void;
  showAlpha?: boolean;
  presets?: string[];
  disabled?: boolean;
  className?: string;
}

export function ColorPicker({
  value: controlledValue,
  defaultValue = '#3b82f6',
  onChange,
  showAlpha = false,
  presets = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#000000', '#ffffff', '#6b7280', '#f97316'],
  disabled = false,
  className = '',
}: ColorPickerProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [hue, setHue] = useState(210);
  const [saturation, setSaturation] = useState(79);
  const [lightness, setLightness] = useState(59);
  const [alpha, setAlpha] = useState(100);
  const pickerRef = useRef<HTMLDivElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  // HSL to Hex conversion
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  // Hex to HSL conversion
  const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const updateColor = (h: number, s: number, l: number, a: number) => {
    const hex = hslToHex(h, s, l);
    const rgb = `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${a / 100})`;
    const hsl = `hsla(${h}, ${s}%, ${l}%, ${a / 100})`;

    if (controlledValue === undefined) {
      setInternalValue(hex);
    }
    setHue(h);
    setSaturation(s);
    setLightness(l);
    setAlpha(a);
    onChange?.({ hex, rgb, hsl });
  };

  const handlePickerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !pickerRef.current) return;

    const rect = pickerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const newSaturation = Math.round(x * 100);
    const newLightness = Math.round((1 - y) * 100);

    updateColor(hue, newSaturation, newLightness, alpha);
  };

  const handlePresetClick = (presetColor: string) => {
    if (disabled) return;
    const hsl = hexToHsl(presetColor);
    updateColor(hsl.h, hsl.s, hsl.l, alpha);
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
    padding: 'var(--space-4)',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--radius-lg)',
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
  };

  const pickerStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '200px',
    background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`,
    borderRadius: 'var(--radius-md)',
    cursor: 'crosshair',
  };

  const pickerIndicatorStyles: React.CSSProperties = {
    position: 'absolute',
    top: `${100 - lightness}%`,
    left: `${saturation}%`,
    width: '16px',
    height: '16px',
    border: '2px solid #FFFFFF',
    borderRadius: '50%',
    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.3)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  };

  const hueSliderStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '12px',
    background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
  };

  const hueThumbStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: `${(hue / 360) * 100}%`,
    transform: 'translate(-50%, -50%)',
    width: '16px',
    height: '16px',
    backgroundColor: '#FFFFFF',
    border: '2px solid var(--color-gray-300)',
    borderRadius: '50%',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    pointerEvents: 'none',
  };

  const previewStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  };

  const previewColorStyles: React.CSSProperties = {
    width: '60px',
    height: '40px',
    backgroundColor: value,
    border: '1px solid var(--color-gray-300)',
    borderRadius: 'var(--radius-md)',
  };

  const hexInputStyles: React.CSSProperties = {
    flex: 1,
    padding: 'var(--space-2) var(--space-3)',
    fontSize: 'var(--text-body-size)',
    fontFamily: 'monospace',
    color: 'var(--color-gray-900)',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-gray-300)',
    borderRadius: 'var(--radius-md)',
    outline: 'none',
  };

  const presetsStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    gap: 'var(--space-2)',
  };

  const presetSwatchStyles = (presetColor: string): React.CSSProperties => ({
    width: '100%',
    aspectRatio: '1',
    backgroundColor: presetColor,
    border: '2px solid',
    borderColor: value === presetColor ? 'var(--color-primary)' : 'var(--color-gray-300)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  return (
    <div className={className} style={containerStyles}>
      {/* Color Picker */}
      <div
        ref={pickerRef}
        style={pickerStyles}
        onClick={handlePickerClick}
      >
        <div style={pickerIndicatorStyles} />
      </div>

      {/* Hue Slider */}
      <div
        style={hueSliderStyles}
        onClick={(e) => {
          if (disabled) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          const newHue = Math.round(x * 360);
          updateColor(newHue, saturation, lightness, alpha);
        }}
      >
        <div style={hueThumbStyles} />
      </div>

      {/* Preview & Hex Input */}
      <div style={previewStyles}>
        <div style={previewColorStyles} />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const hex = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(hex)) {
              const hsl = hexToHsl(hex);
              updateColor(hsl.h, hsl.s, hsl.l, alpha);
            }
          }}
          style={hexInputStyles}
          disabled={disabled}
        />
      </div>

      {/* Preset Swatches */}
      <div style={presetsStyles}>
        {presets.map((preset) => (
          <div
            key={preset}
            style={presetSwatchStyles(preset)}
            onClick={() => handlePresetClick(preset)}
            onMouseEnter={(e) => {
              if (!disabled && value !== preset) {
                e.currentTarget.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default ColorPicker;
