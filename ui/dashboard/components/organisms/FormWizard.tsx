'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '../atoms';
import { FormBuilder, FormSchema } from './FormBuilder';

// Step Configuration
export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  schema: FormSchema;
  optional?: boolean;
}

export interface FormWizardProps {
  steps: WizardStep[];
  onComplete: (data: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
  initialData?: Record<string, any>;
  showStepNumbers?: boolean;
  allowSkipOptional?: boolean;
  className?: string;
}

export const FormWizard: React.FC<FormWizardProps> = ({
  steps,
  onComplete,
  onCancel,
  initialData = {},
  showStepNumbers = true,
  allowSkipOptional = true,
  className = '',
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [wizardData, setWizardData] = useState<Record<string, any>>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Calculate progress percentage
  const progress = useMemo(() => {
    return ((currentStepIndex + 1) / steps.length) * 100;
  }, [currentStepIndex, steps.length]);

  // Handle step data change
  const handleStepChange = useCallback((stepData: Record<string, any>) => {
    setWizardData(prev => ({
      ...prev,
      ...stepData,
    }));
  }, []);

  // Handle next step
  const handleNext = useCallback(async (stepData: Record<string, any>) => {
    // Save step data
    setWizardData(prev => ({
      ...prev,
      ...stepData,
    }));

    // Mark step as completed
    setCompletedSteps(prev => new Set(prev).add(currentStepIndex));

    if (isLastStep) {
      // Final step - submit the form
      setIsSubmitting(true);
      try {
        await onComplete({ ...wizardData, ...stepData });
      } catch (error) {
        console.error('Form wizard submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Move to next step
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStepIndex, isLastStep, wizardData, onComplete]);

  // Handle previous step
  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [isFirstStep]);

  // Handle step click (only for completed steps)
  const handleStepClick = useCallback((stepIndex: number) => {
    if (completedSteps.has(stepIndex) || stepIndex < currentStepIndex) {
      setCurrentStepIndex(stepIndex);
    }
  }, [completedSteps, currentStepIndex]);

  // Handle skip optional step
  const handleSkipStep = useCallback(() => {
    if (currentStep.optional && allowSkipOptional) {
      if (isLastStep) {
        onComplete(wizardData);
      } else {
        setCurrentStepIndex(prev => prev + 1);
      }
    }
  }, [currentStep, allowSkipOptional, isLastStep, wizardData, onComplete]);

  const containerStyles: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
  };

  const progressBarContainerStyles: React.CSSProperties = {
    marginBottom: 'var(--space-8)',
  };

  const progressBarBackgroundStyles: React.CSSProperties = {
    width: '100%',
    height: '8px',
    backgroundColor: 'var(--color-gray-200)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
  };

  const progressBarFillStyles: React.CSSProperties = {
    height: '100%',
    backgroundColor: 'var(--color-primary)',
    transition: 'width 0.3s ease',
    width: `${progress}%`,
  };

  const progressTextStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'var(--space-2)',
    fontSize: 'var(--text-sm-size)',
    color: 'var(--color-gray-600)',
  };

  const stepsNavigationStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 'var(--space-8)',
    position: 'relative',
  };

  const stepStyles = (index: number): React.CSSProperties => {
    const isCompleted = completedSteps.has(index);
    const isCurrent = index === currentStepIndex;
    const isClickable = isCompleted || index < currentStepIndex;

    return {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      cursor: isClickable ? 'pointer' : 'default',
      opacity: isCurrent || isCompleted ? 1 : 0.5,
    };
  };

  const stepCircleStyles = (index: number): React.CSSProperties => {
    const isCompleted = completedSteps.has(index);
    const isCurrent = index === currentStepIndex;

    return {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isCompleted || isCurrent ? 'var(--color-primary)' : 'var(--color-gray-300)',
      color: 'white',
      fontSize: 'var(--text-sm-size)',
      fontWeight: 600,
      marginBottom: 'var(--space-2)',
      border: isCurrent ? '3px solid var(--color-primary-light)' : 'none',
      boxShadow: isCurrent ? '0 0 0 4px rgba(var(--color-primary-rgb), 0.1)' : 'none',
    };
  };

  const stepLabelStyles = (index: number): React.CSSProperties => {
    const isCurrent = index === currentStepIndex;

    return {
      fontSize: 'var(--text-sm-size)',
      fontWeight: isCurrent ? 600 : 400,
      color: isCurrent ? 'var(--color-gray-900)' : 'var(--color-gray-600)',
      textAlign: 'center',
      maxWidth: '120px',
    };
  };

  const stepConnectorStyles = (index: number): React.CSSProperties => {
    const isCompleted = completedSteps.has(index);

    return {
      position: 'absolute',
      top: '20px',
      left: '50%',
      right: '-50%',
      height: '2px',
      backgroundColor: isCompleted ? 'var(--color-primary)' : 'var(--color-gray-300)',
      zIndex: -1,
    };
  };

  const stepContentStyles: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-6)',
    border: '1px solid var(--color-gray-200)',
    marginBottom: 'var(--space-6)',
  };

  const stepHeaderStyles: React.CSSProperties = {
    marginBottom: 'var(--space-6)',
  };

  const stepTitleStyles: React.CSSProperties = {
    fontSize: 'var(--text-xl-size)',
    fontWeight: 700,
    color: 'var(--color-gray-900)',
    marginBottom: 'var(--space-2)',
  };

  const stepDescriptionStyles: React.CSSProperties = {
    fontSize: 'var(--text-base-size)',
    color: 'var(--color-gray-600)',
  };

  const wizardActionsStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'var(--space-3)',
    paddingTop: 'var(--space-6)',
    borderTop: '1px solid var(--color-gray-200)',
  };

  const leftActionsStyles: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--space-3)',
  };

  const rightActionsStyles: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--space-3)',
  };

  return (
    <div className={className} style={containerStyles}>
      {/* Progress Bar */}
      <div style={progressBarContainerStyles}>
        <div style={progressBarBackgroundStyles}>
          <div style={progressBarFillStyles} />
        </div>
        <div style={progressTextStyles}>
          <span>Step {currentStepIndex + 1} of {steps.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      {/* Steps Navigation */}
      <div style={stepsNavigationStyles}>
        {steps.map((step, index) => (
          <div
            key={step.id}
            style={stepStyles(index)}
            onClick={() => handleStepClick(index)}
          >
            <div style={stepCircleStyles(index)}>
              {completedSteps.has(index) ? '✓' : showStepNumbers ? index + 1 : ''}
            </div>
            <div style={stepLabelStyles(index)}>
              {step.title}
              {step.optional && (
                <span style={{ fontSize: 'var(--text-xs-size)', color: 'var(--color-gray-500)', display: 'block' }}>
                  (Optional)
                </span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div style={stepConnectorStyles(index)} />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <div style={stepContentStyles}>
        <div style={stepHeaderStyles}>
          <h2 style={stepTitleStyles}>{currentStep.title}</h2>
          {currentStep.description && (
            <p style={stepDescriptionStyles}>{currentStep.description}</p>
          )}
        </div>

        <FormBuilder
          schema={{
            ...currentStep.schema,
            title: undefined,
            description: undefined,
            submitLabel: undefined,
            cancelLabel: undefined,
          }}
          onSubmit={handleNext}
          initialData={wizardData}
          onChange={handleStepChange}
        />

        {/* Wizard Navigation */}
        <div style={wizardActionsStyles}>
          <div style={leftActionsStyles}>
            {!isFirstStep && (
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                Previous
              </Button>
            )}

            {onCancel && isFirstStep && (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>

          <div style={rightActionsStyles}>
            {currentStep.optional && allowSkipOptional && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleSkipStep}
                disabled={isSubmitting}
              >
                Skip
              </Button>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              form="wizard-form"
            >
              {isLastStep ? 'Complete' : 'Next'}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary (Optional - shown on last step) */}
      {isLastStep && completedSteps.size > 0 && (
        <div style={{
          ...stepContentStyles,
          backgroundColor: 'var(--color-gray-50)',
        }}>
          <h3 style={{
            fontSize: 'var(--text-lg-size)',
            fontWeight: 600,
            color: 'var(--color-gray-900)',
            marginBottom: 'var(--space-4)',
          }}>
            Summary
          </h3>
          <div style={{
            display: 'grid',
            gap: 'var(--space-2)',
          }}>
            {Object.entries(wizardData).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: 'var(--space-2)',
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm-size)',
                }}
              >
                <span style={{ fontWeight: 500, color: 'var(--color-gray-700)' }}>
                  {key}:
                </span>
                <span style={{ color: 'var(--color-gray-900)' }}>
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
