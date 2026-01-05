'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button, Input } from '../atoms';

// Validation Rule
export interface ValidationRuleConfig {
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean | Promise<boolean>;
}

// Field Configuration
export interface ValidatedField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  rules: ValidationRuleConfig[];
  asyncValidation?: boolean;
}

export interface FormValidationProps {
  fields: ValidatedField[];
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showSuccessStates?: boolean;
  className?: string;
}

type FieldState = 'idle' | 'validating' | 'valid' | 'invalid';

interface FieldStatus {
  state: FieldState;
  error: string | null;
  touched: boolean;
}

export const FormValidation: React.FC<FormValidationProps> = ({
  fields,
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
  showSuccessStates = true,
  className = '',
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach(field => {
      initial[field.name] = '';
    });
    return initial;
  });

  const [fieldStatuses, setFieldStatuses] = useState<Record<string, FieldStatus>>(() => {
    const initial: Record<string, FieldStatus> = {};
    fields.forEach(field => {
      initial[field.name] = {
        state: 'idle',
        error: null,
        touched: false,
      };
    });
    return initial;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Validate single field
  const validateField = useCallback(async (
    field: ValidatedField,
    value: any
  ): Promise<string | null> => {
    for (const rule of field.rules) {
      switch (rule.type) {
        case 'required':
          if (value === undefined || value === null || value === '') {
            return rule.message;
          }
          break;

        case 'minLength':
          if (typeof value === 'string' && value.length < rule.value) {
            return rule.message;
          }
          break;

        case 'maxLength':
          if (typeof value === 'string' && value.length > rule.value) {
            return rule.message;
          }
          break;

        case 'min':
          if (typeof value === 'number' && value < rule.value) {
            return rule.message;
          }
          break;

        case 'max':
          if (typeof value === 'number' && value > rule.value) {
            return rule.message;
          }
          break;

        case 'pattern':
          if (typeof value === 'string' && rule.value instanceof RegExp && !rule.value.test(value)) {
            return rule.message;
          }
          break;

        case 'email':
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (typeof value === 'string' && !emailPattern.test(value)) {
            return rule.message;
          }
          break;

        case 'url':
          try {
            new URL(value);
          } catch {
            return rule.message;
          }
          break;

        case 'custom':
          if (rule.validator) {
            const isValid = await rule.validator(value);
            if (!isValid) {
              return rule.message;
            }
          }
          break;
      }
    }

    return null;
  }, []);

  // Handle field validation
  const handleFieldValidation = useCallback(async (fieldName: string) => {
    const field = fields.find(f => f.name === fieldName);
    if (!field) return;

    const value = formData[fieldName];

    // Set validating state
    setFieldStatuses(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        state: 'validating',
      },
    }));

    // Validate
    const error = await validateField(field, value);

    // Update field status
    setFieldStatuses(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        state: error ? 'invalid' : 'valid',
        error,
      },
    }));
  }, [fields, formData, validateField]);

  // Handle field change
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));

    setFormSuccess(false);
    setFormError(null);

    // Validate on change if enabled and field is touched
    if (validateOnChange && fieldStatuses[fieldName]?.touched) {
      handleFieldValidation(fieldName);
    }
  }, [validateOnChange, fieldStatuses, handleFieldValidation]);

  // Handle field blur
  const handleFieldBlur = useCallback((fieldName: string) => {
    setFieldStatuses(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        touched: true,
      },
    }));

    // Validate on blur if enabled
    if (validateOnBlur) {
      handleFieldValidation(fieldName);
    }
  }, [validateOnBlur, handleFieldValidation]);

  // Validate all fields
  const validateAllFields = useCallback(async (): Promise<boolean> => {
    let isValid = true;
    const newStatuses = { ...fieldStatuses };

    // Mark all as touched
    for (const field of fields) {
      newStatuses[field.name] = {
        ...newStatuses[field.name],
        touched: true,
        state: 'validating',
      };
    }
    setFieldStatuses(newStatuses);

    // Validate all fields
    for (const field of fields) {
      const value = formData[field.name];
      const error = await validateField(field, value);

      newStatuses[field.name] = {
        ...newStatuses[field.name],
        state: error ? 'invalid' : 'valid',
        error,
      };

      if (error) {
        isValid = false;
      }
    }

    setFieldStatuses(newStatuses);
    return isValid;
  }, [fields, formData, fieldStatuses, validateField]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    const isValid = await validateAllFields();

    if (!isValid) {
      setFormError('Please fix the errors above before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormSuccess(true);
      setFormError(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Submission failed. Please try again.');
      setFormSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return fields.every(field => {
      const status = fieldStatuses[field.name];
      return status.state === 'valid';
    });
  }, [fields, fieldStatuses]);

  // Render field
  const renderField = (field: ValidatedField) => {
    const status = fieldStatuses[field.name];
    const value = formData[field.name] ?? '';
    const showError = status.touched && status.state === 'invalid';
    const showSuccess = showSuccessStates && status.touched && status.state === 'valid';
    const showValidating = status.state === 'validating';

    const fieldContainerStyles: React.CSSProperties = {
      marginBottom: 'var(--space-4)',
      position: 'relative',
    };

    const labelStyles: React.CSSProperties = {
      display: 'block',
      marginBottom: 'var(--space-2)',
      fontSize: 'var(--text-sm-size)',
      fontWeight: 500,
      color: 'var(--color-gray-700)',
    };

    const inputWrapperStyles: React.CSSProperties = {
      position: 'relative',
    };

    const statusIconStyles: React.CSSProperties = {
      position: 'absolute',
      right: 'var(--space-3)',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: 'var(--text-lg-size)',
    };

    const messageStyles: React.CSSProperties = {
      marginTop: 'var(--space-1)',
      fontSize: 'var(--text-xs-size)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
    };

    const errorMessageStyles: React.CSSProperties = {
      ...messageStyles,
      color: 'var(--color-error)',
    };

    const successMessageStyles: React.CSSProperties = {
      ...messageStyles,
      color: 'var(--color-success)',
    };

    return (
      <div key={field.name} style={fieldContainerStyles}>
        <label htmlFor={field.name} style={labelStyles}>
          {field.label}
          {field.rules.some(r => r.type === 'required') && (
            <span style={{ color: 'var(--color-error)' }}> *</span>
          )}
        </label>

        <div style={inputWrapperStyles}>
          <Input
            id={field.name}
            type={field.type || 'text'}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            onBlur={() => handleFieldBlur(field.name)}
            placeholder={field.placeholder}
            disabled={isSubmitting}
            error={showError}
            style={{
              paddingRight: showError || showSuccess || showValidating ? 'var(--space-10)' : undefined,
            }}
          />

          {showValidating && (
            <div style={{ ...statusIconStyles, color: 'var(--color-gray-400)' }}>
              ⟳
            </div>
          )}

          {showSuccess && (
            <div style={{ ...statusIconStyles, color: 'var(--color-success)' }}>
              ✓
            </div>
          )}

          {showError && (
            <div style={{ ...statusIconStyles, color: 'var(--color-error)' }}>
              ✕
            </div>
          )}
        </div>

        {showError && status.error && (
          <div style={errorMessageStyles}>
            <span>⚠</span>
            <span>{status.error}</span>
          </div>
        )}

        {showSuccess && (
          <div style={successMessageStyles}>
            <span>✓</span>
            <span>Looks good!</span>
          </div>
        )}
      </div>
    );
  };

  const containerStyles: React.CSSProperties = {
    maxWidth: '600px',
    margin: '0 auto',
  };

  const formStyles: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-6)',
    border: '1px solid var(--color-gray-200)',
  };

  const formMessageStyles: React.CSSProperties = {
    padding: 'var(--space-3)',
    borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--space-4)',
    fontSize: 'var(--text-sm-size)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  };

  const errorFormMessageStyles: React.CSSProperties = {
    ...formMessageStyles,
    backgroundColor: 'var(--color-error-light)',
    color: 'var(--color-error-dark)',
    border: '1px solid var(--color-error)',
  };

  const successFormMessageStyles: React.CSSProperties = {
    ...formMessageStyles,
    backgroundColor: 'var(--color-success-light)',
    color: 'var(--color-success-dark)',
    border: '1px solid var(--color-success)',
  };

  const actionsStyles: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--space-3)',
    marginTop: 'var(--space-6)',
    paddingTop: 'var(--space-6)',
    borderTop: '1px solid var(--color-gray-200)',
  };

  const validationSummaryStyles: React.CSSProperties = {
    marginTop: 'var(--space-4)',
    padding: 'var(--space-3)',
    backgroundColor: 'var(--color-gray-50)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--text-sm-size)',
  };

  const validationStatsStyles: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-2)',
  };

  const statItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
  };

  const validCount = fields.filter(f => fieldStatuses[f.name]?.state === 'valid').length;
  const invalidCount = fields.filter(f => fieldStatuses[f.name]?.state === 'invalid').length;
  const untouchedCount = fields.filter(f => !fieldStatuses[f.name]?.touched).length;

  return (
    <div className={className} style={containerStyles}>
      <form onSubmit={handleSubmit} style={formStyles}>
        {formError && (
          <div style={errorFormMessageStyles}>
            <span>⚠</span>
            <span>{formError}</span>
          </div>
        )}

        {formSuccess && (
          <div style={successFormMessageStyles}>
            <span>✓</span>
            <span>Form submitted successfully!</span>
          </div>
        )}

        {fields.map(field => renderField(field))}

        {/* Validation Summary */}
        <div style={validationSummaryStyles}>
          <div style={validationStatsStyles}>
            <div style={statItemStyles}>
              <span style={{ color: 'var(--color-success)' }}>✓ {validCount} Valid</span>
            </div>
            <div style={statItemStyles}>
              <span style={{ color: 'var(--color-error)' }}>✕ {invalidCount} Invalid</span>
            </div>
            <div style={statItemStyles}>
              <span style={{ color: 'var(--color-gray-500)' }}>○ {untouchedCount} Untouched</span>
            </div>
          </div>
          <div style={{
            height: '4px',
            backgroundColor: 'var(--color-gray-200)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${(validCount / fields.length) * 100}%`,
              backgroundColor: 'var(--color-success)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        <div style={actionsStyles}>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !isFormValid}
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};
