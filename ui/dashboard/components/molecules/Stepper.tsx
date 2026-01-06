/**
 * Stepper Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Multi-step process indicator
 */

'use client';

import React from 'react';
import { IconCheck } from '../atoms/icons';

export interface StepperStep {
  /** Step label */
  label: string;
  /** Optional description */
  description?: string;
  /** Optional icon (overrides default number/check) */
  icon?: React.ReactNode;
  /** Whether step is clickable */
  onClick?: () => void;
}

export interface StepperProps {
  /** Stepper steps */
  steps: StepperStep[];
  /** Current active step index (0-based) */
  activeStep: number;
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Show connector lines */
  showConnector?: boolean;
  /** Size variant */
  size?: 'default' | 'small';
}

export function Stepper({
  steps,
  activeStep,
  orientation = 'horizontal',
  showConnector = true,
  size = 'default',
}: StepperProps) {
  const isHorizontal = orientation === 'horizontal';
  const circleSize = size === 'small' ? 32 : 40;
  const iconSize = size === 'small' ? 16 : 20;
  const fontSize = size === 'small' ? 'var(--text-caption-size)' : 'var(--text-body-size)';

  const getStepState = (index: number): 'completed' | 'active' | 'upcoming' => {
    if (index < activeStep) return 'completed';
    if (index === activeStep) return 'active';
    return 'upcoming';
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    gap: isHorizontal ? 'var(--space-4)' : 'var(--space-6)',
    fontFamily: 'var(--font-family-sans)',
  };

  const stepContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: isHorizontal ? 'column' : 'row',
    alignItems: isHorizontal ? 'center' : 'flex-start',
    gap: isHorizontal ? 'var(--space-2)' : 'var(--space-4)',
    flex: isHorizontal ? 1 : 'none',
    position: 'relative',
  };

  const circleWrapperStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: isHorizontal ? 'var(--space-2)' : 0,
    flexDirection: isHorizontal ? 'row' : 'column',
  };

  const getCircleStyles = (state: 'completed' | 'active' | 'upcoming', isClickable: boolean): React.CSSProperties => ({
    width: circleSize,
    height: circleSize,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size === 'small' ? 'var(--text-caption-size)' : 'var(--text-body-size)',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    cursor: isClickable ? 'pointer' : 'default',
    flexShrink: 0,
    backgroundColor:
      state === 'completed'
        ? 'var(--color-primary)'
        : state === 'active'
          ? 'var(--color-primary)'
          : '#FFFFFF',
    border: `2px solid ${
      state === 'completed'
        ? 'var(--color-primary)'
        : state === 'active'
          ? 'var(--color-primary)'
          : 'var(--color-gray-300)'
    }`,
    color:
      state === 'completed' || state === 'active'
        ? '#FFFFFF'
        : 'var(--color-gray-500)',
  });

  const getConnectorStyles = (state: 'completed' | 'active' | 'upcoming'): React.CSSProperties => ({
    position: isHorizontal ? 'relative' : 'absolute',
    backgroundColor: state === 'completed' ? 'var(--color-primary)' : 'var(--color-gray-300)',
    transition: 'background-color 0.3s ease',
    ...(isHorizontal
      ? {
          height: '2px',
          flex: 1,
          top: circleSize / 2 - 1,
        }
      : {
          width: '2px',
          height: 'calc(100% + var(--space-6))',
          left: circleSize / 2 - 1,
          top: circleSize,
        }),
  });

  const labelStyles = (state: 'completed' | 'active' | 'upcoming'): React.CSSProperties => ({
    fontSize,
    fontWeight: state === 'active' ? 600 : 400,
    color:
      state === 'active'
        ? 'var(--color-gray-900)'
        : state === 'completed'
          ? 'var(--color-gray-700)'
          : 'var(--color-gray-500)',
    textAlign: isHorizontal ? 'center' : 'left',
  });

  const descriptionStyles: React.CSSProperties = {
    fontSize: 'var(--text-caption-size)',
    color: 'var(--color-gray-600)',
    marginTop: 'var(--space-1)',
    textAlign: isHorizontal ? 'center' : 'left',
  };

  return (
    <div style={containerStyles}>
      {steps.map((step, index) => {
        const state = getStepState(index);
        const isClickable = !!step.onClick;
        const isLast = index === steps.length - 1;

        return (
          <div key={index} style={stepContainerStyles}>
            {/* Circle and Connector */}
            <div style={circleWrapperStyles}>
              {/* Step Circle */}
              <div
                style={getCircleStyles(state, isClickable)}
                onClick={isClickable ? step.onClick : undefined}
                onMouseEnter={(e) => {
                  if (isClickable) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isClickable) {
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                {state === 'completed' ? (
                  step.icon || <IconCheck size={iconSize} color="#FFFFFF" />
                ) : step.icon ? (
                  step.icon
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Connector Line */}
              {showConnector && !isLast && isHorizontal && (
                <div style={getConnectorStyles(state)} />
              )}
            </div>

            {/* Connector Line (Vertical) */}
            {showConnector && !isLast && !isHorizontal && (
              <div style={getConnectorStyles(state)} />
            )}

            {/* Label and Description */}
            <div style={{ flex: isHorizontal ? 'none' : 1 }}>
              <div style={labelStyles(state)}>{step.label}</div>
              {step.description && (
                <div style={descriptionStyles}>{step.description}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Stepper;
