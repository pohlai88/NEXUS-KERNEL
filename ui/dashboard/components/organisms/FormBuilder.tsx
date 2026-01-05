'use client';

import React, { useState, useCallback } from 'react';
import { Button, Input, Checkbox, RadioGroup } from '../atoms';
import { Select } from '../molecules';

// Field Types
export type FormFieldType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'time' | 'file';

// Validation Rules
export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any, formData: Record<string, any>) => boolean;
}

// Conditional Field Display
export interface ConditionalLogic {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
}

// Field Options (for select, radio, checkbox)
export interface FieldOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// Field Configuration
export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  defaultValue?: any;
  options?: FieldOption[];
  validation?: ValidationRule[];
  conditional?: ConditionalLogic;
  helpText?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number; // For textarea
  multiple?: boolean; // For select
}

// Form Schema
export interface FormSchema {
  title?: string;
  description?: string;
  fields: FormField[];
  submitLabel?: string;
  cancelLabel?: string;
}

export interface FormBuilderProps {
  schema: FormSchema;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
  initialData?: Record<string, any>;
  onChange?: (data: Record<string, any>) => void;
  className?: string;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  schema,
  onSubmit,
  onCancel,
  initialData = {},
  onChange,
  className = '',
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = { ...initialData };
    schema.fields.forEach(field => {
      if (!(field.name in initial) && field.defaultValue !== undefined) {
        initial[field.name] = field.defaultValue;
      }
    });
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate single field
  const validateField = useCallback((field: FormField, value: any): string | null => {
    if (!field.validation) return null;

    for (const rule of field.validation) {
      switch (rule.type) {
        case 'required':
          if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
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
          if (rule.validator && !rule.validator(value, formData)) {
            return rule.message;
          }
          break;
      }
    }

    return null;
  }, [formData]);

  // Check if field should be visible based on conditional logic
  const isFieldVisible = useCallback((field: FormField): boolean => {
    if (!field.conditional) return true;

    const { field: condField, operator, value: condValue } = field.conditional;
    const fieldValue = formData[condField];

    switch (operator) {
      case 'equals':
        return fieldValue === condValue;
      case 'notEquals':
        return fieldValue !== condValue;
      case 'contains':
        return typeof fieldValue === 'string' && fieldValue.includes(condValue);
      case 'greaterThan':
        return typeof fieldValue === 'number' && fieldValue > condValue;
      case 'lessThan':
        return typeof fieldValue === 'number' && fieldValue < condValue;
      default:
        return true;
    }
  }, [formData]);

  // Handle field change
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    const newData = { ...formData, [fieldName]: value };
    setFormData(newData);

    // Validate on change if field was touched
    if (touched[fieldName]) {
      const field = schema.fields.find(f => f.name === fieldName);
      if (field) {
        const error = validateField(field, value);
        setErrors(prev => ({
          ...prev,
          [fieldName]: error || '',
        }));
      }
    }

    // Notify parent
    onChange?.(newData);
  }, [formData, touched, schema.fields, validateField, onChange]);

  // Handle field blur
  const handleFieldBlur = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    const field = schema.fields.find(f => f.name === fieldName);
    if (field) {
      const value = formData[fieldName];
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error || '',
      }));
    }
  }, [formData, schema.fields, validateField]);

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    schema.fields.forEach(field => {
      if (isFieldVisible(field)) {
        const value = formData[field.name];
        const error = validateField(field, value);
        if (error) {
          newErrors[field.name] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    setTouched(
      schema.fields.reduce((acc, field) => {
        acc[field.name] = true;
        return acc;
      }, {} as Record<string, boolean>)
    );

    return isValid;
  }, [schema.fields, formData, isFieldVisible, validateField]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render field based on type
  const renderField = (field: FormField) => {
    if (!isFieldVisible(field)) return null;

    const value = formData[field.name] ?? '';
    const error = errors[field.name];
    const showError = touched[field.name] && error;

    const fieldStyles: React.CSSProperties = {
      marginBottom: 'var(--space-4)',
    };

    const labelStyles: React.CSSProperties = {
      display: 'block',
      marginBottom: 'var(--space-2)',
      fontSize: 'var(--text-sm-size)',
      fontWeight: 500,
      color: 'var(--color-gray-700)',
    };

    const helpTextStyles: React.CSSProperties = {
      marginTop: 'var(--space-1)',
      fontSize: 'var(--text-xs-size)',
      color: 'var(--color-gray-500)',
    };

    const errorStyles: React.CSSProperties = {
      marginTop: 'var(--space-1)',
      fontSize: 'var(--text-xs-size)',
      color: 'var(--color-error)',
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'tel':
      case 'url':
        return (
          <div key={field.id} style={fieldStyles}>
            <label htmlFor={field.id} style={labelStyles}>
              {field.label}
              {field.required && <span style={{ color: 'var(--color-error)' }}> *</span>}
            </label>
            <Input
              id={field.id}
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              onBlur={() => handleFieldBlur(field.name)}
              placeholder={field.placeholder}
              disabled={field.disabled || isSubmitting}
              error={!!showError}
            />
            {field.helpText && !showError && <div style={helpTextStyles}>{field.helpText}</div>}
            {showError && <div style={errorStyles}>{error}</div>}
          </div>
        );

      case 'date':
      case 'time':
        return (
          <div key={field.id} style={fieldStyles}>
            <label htmlFor={field.id} style={labelStyles}>
              {field.label}
              {field.required && <span style={{ color: 'var(--color-error)' }}> *</span>}
            </label>
            <input
              id={field.id}
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              onBlur={() => handleFieldBlur(field.name)}
              disabled={field.disabled || isSubmitting}
              style={{
                width: '100%',
                padding: 'var(--space-2)',
                fontSize: 'var(--text-sm-size)',
                border: `1px solid ${showError ? 'var(--color-error)' : 'var(--color-gray-300)'}`,
                borderRadius: 'var(--radius-md)',
                fontFamily: 'inherit',
              }}
            />
            {field.helpText && !showError && <div style={helpTextStyles}>{field.helpText}</div>}
            {showError && <div style={errorStyles}>{error}</div>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} style={fieldStyles}>
            <label htmlFor={field.id} style={labelStyles}>
              {field.label}
              {field.required && <span style={{ color: 'var(--color-error)' }}> *</span>}
            </label>
            <textarea
              id={field.id}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              onBlur={() => handleFieldBlur(field.name)}
              placeholder={field.placeholder}
              disabled={field.disabled || isSubmitting}
              rows={field.rows || 4}
              style={{
                width: '100%',
                padding: 'var(--space-2)',
                fontSize: 'var(--text-sm-size)',
                border: `1px solid ${showError ? 'var(--color-error)' : 'var(--color-gray-300)'}`,
                borderRadius: 'var(--radius-md)',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
            {field.helpText && !showError && <div style={helpTextStyles}>{field.helpText}</div>}
            {showError && <div style={errorStyles}>{error}</div>}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} style={fieldStyles}>
            <label htmlFor={field.id} style={labelStyles}>
              {field.label}
              {field.required && <span style={{ color: 'var(--color-error)' }}> *</span>}
            </label>
            <Select
              value={value}
              onChange={(newValue) => handleFieldChange(field.name, newValue)}
              options={field.options || []}
              placeholder={field.placeholder}
              disabled={field.disabled || isSubmitting}
              error={!!showError}
            />
            {field.helpText && !showError && <div style={helpTextStyles}>{field.helpText}</div>}
            {showError && <div style={errorStyles}>{error}</div>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} style={{ ...fieldStyles, display: 'flex', alignItems: 'flex-start' }}>
            <Checkbox
              id={field.id}
              checked={!!value}
              onChange={(checked) => handleFieldChange(field.name, checked)}
              disabled={field.disabled || isSubmitting}
            />
            <div style={{ marginLeft: 'var(--space-2)' }}>
              <label htmlFor={field.id} style={{ ...labelStyles, marginBottom: 0, cursor: 'pointer' }}>
                {field.label}
                {field.required && <span style={{ color: 'var(--color-error)' }}> *</span>}
              </label>
              {field.helpText && <div style={helpTextStyles}>{field.helpText}</div>}
              {showError && <div style={errorStyles}>{error}</div>}
            </div>
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} style={fieldStyles}>
            <label style={labelStyles}>
              {field.label}
              {field.required && <span style={{ color: 'var(--color-error)' }}> *</span>}
            </label>
            <RadioGroup
              name={field.name}
              value={String(value)}
              onChange={(newValue) => handleFieldChange(field.name, newValue)}
              options={(field.options || []).map(opt => ({
                ...opt,
                value: String(opt.value),
                disabled: opt.disabled || field.disabled || isSubmitting,
              }))}
            />
            {field.helpText && !showError && <div style={helpTextStyles}>{field.helpText}</div>}
            {showError && <div style={errorStyles}>{error}</div>}
          </div>
        );

      case 'file':
        return (
          <div key={field.id} style={fieldStyles}>
            <label htmlFor={field.id} style={labelStyles}>
              {field.label}
              {field.required && <span style={{ color: 'var(--color-error)' }}> *</span>}
            </label>
            <input
              id={field.id}
              type="file"
              onChange={(e) => handleFieldChange(field.name, e.target.files?.[0])}
              onBlur={() => handleFieldBlur(field.name)}
              disabled={field.disabled || isSubmitting}
              multiple={field.multiple}
              style={{
                display: 'block',
                width: '100%',
                padding: 'var(--space-2)',
                fontSize: 'var(--text-sm-size)',
                border: `1px solid ${showError ? 'var(--color-error)' : 'var(--color-gray-300)'}`,
                borderRadius: 'var(--radius-md)',
              }}
            />
            {field.helpText && !showError && <div style={helpTextStyles}>{field.helpText}</div>}
            {showError && <div style={errorStyles}>{error}</div>}
          </div>
        );

      default:
        return null;
    }
  };

  const containerStyles: React.CSSProperties = {
    maxWidth: '600px',
    margin: '0 auto',
  };

  const headerStyles: React.CSSProperties = {
    marginBottom: 'var(--space-6)',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: 'var(--text-2xl-size)',
    fontWeight: 700,
    color: 'var(--color-gray-900)',
    marginBottom: 'var(--space-2)',
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: 'var(--text-base-size)',
    color: 'var(--color-gray-600)',
  };

  const actionsStyles: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--space-3)',
    marginTop: 'var(--space-6)',
    paddingTop: 'var(--space-6)',
    borderTop: '1px solid var(--color-gray-200)',
  };

  return (
    <div className={className} style={containerStyles}>
      {(schema.title || schema.description) && (
        <div style={headerStyles}>
          {schema.title && <h2 style={titleStyles}>{schema.title}</h2>}
          {schema.description && <p style={descriptionStyles}>{schema.description}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {schema.fields.map(field => renderField(field))}

        <div style={actionsStyles}>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {schema.submitLabel || 'Submit'}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {schema.cancelLabel || 'Cancel'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
