'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui-primitives/Button';
import { Input } from '@/components/atoms/Input';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Radio, RadioGroup } from '@/components/atoms/Radio';
import { Textarea } from '@/components/atoms/Textarea';
import { Switch } from '@/components/atoms/Switch';
import { Chip } from '@/components/atoms/Chip';
import { DatePicker } from '@/components/atoms/DatePicker';
import { FileUpload } from '@/components/atoms/FileUpload';
import { Avatar } from '@/components/atoms/Avatar';
import { AvatarGroup } from '@/components/atoms/AvatarGroup';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar, SkeletonTable } from '@/components/atoms/Skeleton';
import { List, ListItem, OrderedList, UnorderedList } from '@/components/atoms/List';
import { Stat, StatGrid } from '@/components/atoms/Stat';
import { Divider } from '@/components/atoms/Divider';
import { Timeline, TimelineItem } from '@/components/atoms/Timeline';
import { Tooltip } from '@/components/atoms/Tooltip';
import { Spinner } from '@/components/atoms/Spinner';
import { Toast } from '@/components/molecules/Toast';
import { Menu } from '@/components/molecules/Menu';
import { Breadcrumb } from '@/components/molecules/Breadcrumb';
import { Stepper } from '@/components/molecules/Stepper';
import { Popover } from '@/components/molecules/Popover';
import { Snackbar } from '@/components/molecules/Snackbar';
import { KPI, KPIGrid } from '@/components/molecules/KPI';
import { Accordion, AccordionItem } from '@/components/molecules/Accordion';
import { Pagination } from '@/components/molecules/Pagination';
import { Slider } from '@/components/atoms/Slider';
import { ColorPicker } from '@/components/atoms/ColorPicker';
import { TreeView } from '@/components/molecules/TreeView';
import { Transfer } from '@/components/molecules/Transfer';
import { TablePagination } from '@/components/molecules/TablePagination';
import { VirtualList } from '@/components/molecules/VirtualList';
import { Calendar } from '@/components/molecules/Calendar';
import { DataTable } from '@/components/organisms/DataTable';
import { Carousel } from '@/components/organisms/Carousel';
import { ImageGallery } from '@/components/organisms/ImageGallery';
import { TimelineAdvanced } from '@/components/organisms/TimelineAdvanced';
import { RichTextEditor } from '@/components/organisms/RichTextEditor';
import { LineChart } from '@/components/organisms/LineChart';
import { BarChart } from '@/components/organisms/BarChart';
import { PieChart } from '@/components/organisms/PieChart';
import { Sparkline } from '@/components/organisms/Sparkline';
import {
  IconCheck,
  IconPlus,
  IconEdit,
  IconDelete,
  IconSearch,
  IconFilter,
  IconDownload,
  IconUpload,
  IconSettings,
  IconMoreVert,
  IconUser,
  IconCalendar,
  IconHome,
  IconArrowUp,
  IconArrowDown,
  IconInfo,
} from '@/components/atoms/icons';

export default function ComponentShowcase() {
  const [inputValue, setInputValue] = useState('');
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [textareaValue, setTextareaValue] = useState('');
  const [switchChecked, setSwitchChecked] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [progress, setProgress] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarVariant, setSnackbarVariant] = useState<'default' | 'success' | 'error' | 'warning' | 'info'>('success');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sliderValue, setSliderValue] = useState(50);
  const [colorValue, setColorValue] = useState('#3b82f6');
  const [sourceItems, setSourceItems] = useState([
    { key: '1', label: 'TypeScript' },
    { key: '2', label: 'JavaScript' },
    { key: '3', label: 'Python' },
    { key: '4', label: 'Java' },
    { key: '5', label: 'C++' },
    { key: '6', label: 'Ruby' },
    { key: '7', label: 'Go' },
    { key: '8', label: 'Rust' },
  ]);
  const [targetItems, setTargetItems] = useState([
    { key: '9', label: 'React' },
    { key: '10', label: 'Vue' },
  ]);
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(10);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [editorContent, setEditorContent] = useState('<p>Start typing here...</p>');

  return (
    <DashboardLayout>
      <div style={{
        padding: 'var(--space-8)',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Page Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{
            fontSize: 'var(--text-display-size)',
            fontWeight: 700,
            color: 'var(--color-gray-900)',
            marginBottom: 'var(--space-2)',
          }}>
            Component Showcase
          </h1>
          <p style={{
            fontSize: 'var(--text-body-size)',
            color: 'var(--color-gray-600)',
          }}>
            All Phases: Icon Library (31) • Forms (Input, Checkbox, Radio, Textarea, Switch, Chip, DatePicker, FileUpload) • Navigation (Breadcrumb, Stepper) • Identity (Avatar, AvatarGroup) • Feedback (Spinner, Toast, Menu)
          </p>
        </div>

        {/* Icons Section */}
        <Section title="Icon Library" description="31 Material Design icons">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 'var(--space-4)',
          }}>
            {[
              { name: 'Check', Icon: IconCheck },
              { name: 'Plus', Icon: IconPlus },
              { name: 'Edit', Icon: IconEdit },
              { name: 'Delete', Icon: IconDelete },
              { name: 'Search', Icon: IconSearch },
              { name: 'Filter', Icon: IconFilter },
              { name: 'Download', Icon: IconDownload },
              { name: 'Upload', Icon: IconUpload },
              { name: 'Settings', Icon: IconSettings },
              { name: 'More', Icon: IconMoreVert },
            ].map(({ name, Icon }) => (
              <div key={name} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-4)',
                border: '1px solid var(--color-gray-200)',
                borderRadius: 'var(--radius-lg)',
              }}>
                <Icon size={24} color="var(--color-primary)" />
                <span style={{
                  fontSize: 'var(--text-caption-size)',
                  color: 'var(--color-gray-600)',
                }}>
                  {name}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Input Section */}
        <Section title="Input Component" description="40 variants: 5 states × 4 icon positions × 2 label styles">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Basic Input */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Basic Input
              </h4>
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                fullWidth
              />
            </div>

            {/* Input with Left Icon */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Search Input (Left Icon)
              </h4>
              <Input
                label="Search"
                type="search"
                placeholder="Search products..."
                iconPosition="left"
                fullWidth
              />
            </div>

            {/* Floating Label */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Floating Label
              </h4>
              <Input
                label="Username"
                labelPosition="floating"
                placeholder="Enter username"
                fullWidth
              />
            </div>

            {/* Error State */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Error State
              </h4>
              <Input
                label="Password"
                type="password"
                error
                errorMessage="Password must be at least 8 characters"
                fullWidth
              />
            </div>

            {/* Helper Text */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                With Helper Text
              </h4>
              <Input
                label="API Key"
                helperText="You can find this in your account settings"
                fullWidth
              />
            </div>

            {/* Disabled */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Disabled State
              </h4>
              <Input
                label="Read Only Field"
                value="Cannot edit this"
                disabled
                fullWidth
              />
            </div>
          </div>
        </Section>

        {/* Checkbox Section */}
        <Section title="Checkbox Component" description="24 variants: 4 states × 3 label positions × 2 sizes">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Checkbox label="I agree to the terms and conditions" />
            <Checkbox label="Remember me" labelPosition="left" />
            <Checkbox label="Select all items" indeterminate />
            <Checkbox label="Subscribe to newsletter" size="small" />
            <Checkbox label="Required field" error />
            <Checkbox label="Cannot change (disabled)" disabled checked />
          </div>
        </Section>

        {/* Radio Section - NEW PHASE 2 */}
        <Section title="Radio Component (Phase 2)" description="16 variants: 3 states × 3 label positions × 2 sizes">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Basic Radio Group */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Basic Radio Group
              </h4>
              <RadioGroup
                name="basic-options"
                value={radioValue}
                onChange={setRadioValue}
                options={[
                  { label: 'Option 1', value: 'option1' },
                  { label: 'Option 2', value: 'option2' },
                  { label: 'Option 3 (Disabled)', value: 'option3', disabled: true },
                ]}
              />
            </div>

            {/* Horizontal Layout */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Horizontal Layout
              </h4>
              <RadioGroup
                name="payment-method"
                label="Payment Method"
                value={radioValue}
                onChange={setRadioValue}
                orientation="horizontal"
                options={[
                  { label: 'Credit Card', value: 'credit' },
                  { label: 'PayPal', value: 'paypal' },
                  { label: 'Bank Transfer', value: 'bank' },
                ]}
              />
            </div>

            {/* Small Size */}
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <Radio label="Small Radio" value="small1" size="small" />
              <Radio label="Default Radio" value="default1" />
            </div>
          </div>
        </Section>

        {/* Textarea Section - NEW PHASE 2 */}
        <Section title="Textarea Component (Phase 2)" description="20 variants with floating labels and auto-resize">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Basic Textarea */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Basic Textarea
              </h4>
              <Textarea
                label="Description"
                placeholder="Enter a detailed description..."
                fullWidth
                minRows={3}
              />
            </div>

            {/* Floating Label */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Floating Label
              </h4>
              <Textarea
                label="Comments"
                labelPosition="floating"
                fullWidth
                minRows={4}
              />
            </div>

            {/* Auto-Resize with Character Count */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Auto-Resize with Character Count
              </h4>
              <Textarea
                label="Feedback"
                placeholder="Your feedback helps us improve..."
                autoResize
                showCharCount
                maxLength={500}
                helperText="Maximum 500 characters"
                fullWidth
                minRows={3}
                maxRows={8}
              />
            </div>

            {/* Error State */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Error State
              </h4>
              <Textarea
                label="Message"
                error
                errorMessage="This field is required"
                fullWidth
                minRows={3}
              />
            </div>
          </div>
        </Section>

        {/* Switch Section - NEW PHASE 2 */}
        <Section title="Switch Component (Phase 2)" description="12 variants: 3 states × 3 label positions × 2 sizes">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Switch
              label="Enable notifications"
              checked={switchChecked}
              onCheckedChange={setSwitchChecked}
            />
            <Switch
              label="Dark mode"
              labelPosition="left"
            />
            <Switch
              label="Auto-save"
              size="small"
            />
            <Switch
              label="Cannot toggle (disabled)"
              disabled
              checked
            />
          </div>
        </Section>

        {/* Chip Section - NEW PHASE 2 */}
        <Section title="Chip Component (Phase 2)" description="6 color variants with removable option">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Color Variants */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Color Variants
              </h4>
              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <Chip label="Default" variant="default" />
                <Chip label="Primary" variant="primary" />
                <Chip label="Success" variant="success" />
                <Chip label="Warning" variant="warning" />
                <Chip label="Error" variant="error" />
                <Chip label="Info" variant="info" />
              </div>
            </div>

            {/* Removable Chips */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Removable Chips (Tags)
              </h4>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <Chip label="React" variant="primary" removable onRemove={() => console.log('Remove React')} />
                <Chip label="TypeScript" variant="primary" removable onRemove={() => console.log('Remove TypeScript')} />
                <Chip label="Next.js" variant="primary" removable onRemove={() => console.log('Remove Next.js')} />
              </div>
            </div>

            {/* With Icons */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                With Icons
              </h4>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <Chip
                  label="Admin"
                  variant="success"
                  icon={<IconUser size={14} color="#10B981" />}
                />
                <Chip
                  label="John Doe"
                  variant="default"
                  icon={<IconUser size={14} color="var(--color-gray-600)" />}
                  removable
                />
              </div>
            </div>

            {/* Small Size */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Small Size
              </h4>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <Chip label="Tag 1" size="small" />
                <Chip label="Tag 2" size="small" variant="primary" />
                <Chip label="Tag 3" size="small" variant="success" removable />
              </div>
            </div>
          </div>
        </Section>

        {/* DatePicker Section - NEW PHASE 2 */}
        <Section title="DatePicker Component (Phase 2)" description="Calendar with date selection and constraints">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Basic DatePicker */}
            <div style={{ maxWidth: '400px' }}>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Basic DatePicker
              </h4>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={setSelectedDate}
                fullWidth
              />
            </div>

            {/* With Min/Max Dates */}
            <div style={{ maxWidth: '400px' }}>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Date Range Constraints
              </h4>
              <DatePicker
                label="Appointment Date"
                placeholder="Select future date"
                minDate={new Date()}
                maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}
                fullWidth
              />
            </div>

            {/* Different Format */}
            <div style={{ maxWidth: '400px' }}>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                DD/MM/YYYY Format
              </h4>
              <DatePicker
                label="Birth Date"
                dateFormat="DD/MM/YYYY"
                fullWidth
              />
            </div>
          </div>
        </Section>

        {/* FileUpload Section - NEW PHASE 2 */}
        <Section title="FileUpload Component (Phase 2)" description="Drag & drop with file validation">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Basic Upload */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Basic File Upload
              </h4>
              <FileUpload
                label="Upload Documents"
                helperText="Drag and drop files here or click to browse"
                multiple
                fullWidth
              />
            </div>

            {/* Image Only */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Image Upload Only
              </h4>
              <FileUpload
                label="Profile Picture"
                accept="image/*"
                maxSize={5 * 1024 * 1024}
                helperText="Maximum file size: 5MB"
                fullWidth
              />
            </div>

            {/* Multiple Files with Limit */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Multiple Files (Max 3)
              </h4>
              <FileUpload
                label="Attachments"
                accept=".pdf,.doc,.docx"
                multiple
                maxFiles={3}
                maxSize={10 * 1024 * 1024}
                helperText="PDF or Word documents, max 10MB each"
                fullWidth
              />
            </div>
          </div>
        </Section>

        {/* Checkbox Section */}
        <Section title="Checkbox Component" description="24 variants: 4 states × 3 label positions × 2 sizes">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Checkbox label="I agree to the terms and conditions" />
            <Checkbox label="Remember me" labelPosition="left" />
            <Checkbox label="Select all items" indeterminate />
            <Checkbox label="Subscribe to newsletter" size="small" />
            <Checkbox label="Required field" error />
            <Checkbox label="Cannot change (disabled)" disabled checked />
          </div>
        </Section>

        {/* Spinner Section */}
        <Section title="Spinner Component" description="9 variants: 3 sizes × 3 colors">
          <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <Spinner size="small" />
              <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-caption-size)' }}>Small</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Spinner size="medium" />
              <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-caption-size)' }}>Medium</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Spinner size="large" />
              <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-caption-size)' }}>Large</p>
            </div>
            <div style={{ textAlign: 'center', backgroundColor: 'var(--color-primary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
              <Spinner color="white" />
              <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-caption-size)', color: 'white' }}>White</p>
            </div>
          </div>
        </Section>

        {/* Toast Section */}
        <Section title="Toast Component" description="12 variants: 4 types × 3 positions">
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              onClick={() => {
                setToastType('success');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 100);
                setTimeout(() => setShowToast(true), 150);
              }}
            >
              Success Toast
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setToastType('error');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 100);
                setTimeout(() => setShowToast(true), 150);
              }}
            >
              Error Toast
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setToastType('warning');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 100);
                setTimeout(() => setShowToast(true), 150);
              }}
            >
              Warning Toast
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setToastType('info');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 100);
                setTimeout(() => setShowToast(true), 150);
              }}
            >
              Info Toast
            </Button>
          </div>

          {showToast && (
            <Toast
              type={toastType}
              message={`${toastType.charAt(0).toUpperCase() + toastType.slice(1)} Notification`}
              description="This is a sample toast message to demonstrate the component"
              position="top-right"
              duration={5000}
              onClose={() => setShowToast(false)}
            />
          )}
        </Section>

        {/* Menu Section */}
        <Section title="Menu Component" description="Dropdown and context menus">
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <Menu
              trigger={
                <Button variant="secondary">
                  Actions Menu
                </Button>
              }
              position="bottom-left"
              items={[
                {
                  type: 'header',
                  label: 'Actions'
                },
                {
                  type: 'item',
                  label: 'Edit',
                  icon: <IconEdit size={16} color="var(--color-gray-600)" />,
                  onClick: () => console.log('Edit clicked')
                },
                {
                  type: 'item',
                  label: 'Download',
                  icon: <IconDownload size={16} color="var(--color-gray-600)" />,
                  onClick: () => console.log('Download clicked')
                },
                {
                  type: 'divider'
                },
                {
                  type: 'item',
                  label: 'Delete',
                  icon: <IconDelete size={16} color="var(--color-error)" />,
                  danger: true,
                  onClick: () => console.log('Delete clicked')
                }
              ]}
            />

            <Menu
              trigger={
                <button style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 'var(--space-2)',
                }}>
                  <IconMoreVert size={24} color="var(--color-gray-600)" />
                </button>
              }
              position="bottom-right"
              items={[
                {
                  type: 'item',
                  label: 'Settings',
                  icon: <IconSettings size={16} color="var(--color-gray-600)" />,
                },
                {
                  type: 'item',
                  label: 'Help',
                  disabled: true,
                }
              ]}
            />
          </div>
        </Section>

        {/* Button Variants (Existing) */}
        <Section title="Button Component (Existing)" description="36 variants from previous build">
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="destructive">Destructive Button</Button>
            <Button variant="primary" state="disabled">Disabled Button</Button>
            <Button variant="primary">With Icon</Button>
          </div>
        </Section>

        {/* Breadcrumb Section - NEW PHASE 3 */}
        <Section title="Breadcrumb Component (Phase 3)" description="Hierarchical navigation trail">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Basic Breadcrumb */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Basic Breadcrumb
              </h4>
              <Breadcrumb
                items={[
                  { label: 'Home', onClick: () => console.log('Home') },
                  { label: 'Products', onClick: () => console.log('Products') },
                  { label: 'Electronics', onClick: () => console.log('Electronics') },
                  { label: 'Laptop' },
                ]}
              />
            </div>

            {/* With Home Icon */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                With Home Icon
              </h4>
              <Breadcrumb
                showHomeIcon
                items={[
                  { label: 'Home', onClick: () => console.log('Home') },
                  { label: 'Settings', onClick: () => console.log('Settings') },
                  { label: 'Profile' },
                ]}
              />
            </div>

            {/* Collapsed (Max Items) */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Collapsed (Max 3 Items)
              </h4>
              <Breadcrumb
                maxItems={3}
                items={[
                  { label: 'Home', onClick: () => console.log('Home') },
                  { label: 'Products', onClick: () => console.log('Products') },
                  { label: 'Category', onClick: () => console.log('Category') },
                  { label: 'Subcategory', onClick: () => console.log('Subcategory') },
                  { label: 'Item' },
                ]}
              />
            </div>

            {/* Small Size */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Small Size
              </h4>
              <Breadcrumb
                size="small"
                items={[
                  { label: 'Dashboard', onClick: () => console.log('Dashboard') },
                  { label: 'Analytics' },
                ]}
              />
            </div>
          </div>
        </Section>

        {/* Stepper Section - NEW PHASE 3 */}
        <Section title="Stepper Component (Phase 3)" description="Multi-step process indicator">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Horizontal Stepper */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Horizontal Stepper
              </h4>
              <Stepper
                activeStep={activeStep}
                orientation="horizontal"
                steps={[
                  { label: 'Account', description: 'Create your account' },
                  { label: 'Profile', description: 'Fill your profile' },
                  { label: 'Verification', description: 'Verify your email' },
                  { label: 'Complete', description: 'All done!' },
                ]}
              />
              <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
                <Button
                  variant="secondary"
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  state={activeStep === 0 ? 'disabled' : 'default'}
                >
                  Previous
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setActiveStep(Math.min(3, activeStep + 1))}
                  state={activeStep === 3 ? 'disabled' : 'default'}
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Vertical Stepper */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Vertical Stepper
              </h4>
              <Stepper
                activeStep={1}
                orientation="vertical"
                steps={[
                  { label: 'Order Placed', description: 'Your order has been confirmed' },
                  { label: 'Processing', description: 'We are preparing your items' },
                  { label: 'Shipped', description: 'Package on the way' },
                  { label: 'Delivered', description: 'Enjoy your purchase!' },
                ]}
              />
            </div>

            {/* Small Stepper */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Small Size
              </h4>
              <Stepper
                activeStep={0}
                size="small"
                orientation="horizontal"
                steps={[
                  { label: 'Step 1' },
                  { label: 'Step 2' },
                  { label: 'Step 3' },
                ]}
              />
            </div>
          </div>
        </Section>

        {/* Avatar Section - NEW PHASE 3 */}
        <Section title="Avatar Component (Phase 3)" description="User profile images with fallback initials">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Sizes */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Sizes
              </h4>
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                <Avatar name="John Doe" size="xs" />
                <Avatar name="Jane Smith" size="sm" />
                <Avatar name="Alex Johnson" size="md" />
                <Avatar name="Sarah Williams" size="lg" />
                <Avatar name="Michael Brown" size="xl" />
              </div>
            </div>

            {/* With Images */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                With Images (Fallback to Initials)
              </h4>
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                <Avatar
                  name="User One"
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  size="md"
                />
                <Avatar
                  name="User Two"
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka"
                  size="md"
                />
                <Avatar name="No Image" src="invalid-url" size="md" />
              </div>
            </div>

            {/* Status Indicators */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Status Indicators
              </h4>
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                <Avatar name="Online User" status="online" size="lg" />
                <Avatar name="Away User" status="away" size="lg" />
                <Avatar name="Busy User" status="busy" size="lg" />
                <Avatar name="Offline User" status="offline" size="lg" />
              </div>
            </div>

            {/* Shapes */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Shapes
              </h4>
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                <Avatar name="Circle Avatar" shape="circle" size="lg" />
                <Avatar name="Square Avatar" shape="square" size="lg" />
              </div>
            </div>
          </div>
        </Section>

        {/* AvatarGroup Section - NEW PHASE 3 */}
        <Section title="AvatarGroup Component (Phase 3)" description="Multiple avatars with overlap and overflow">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Basic Group */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Basic Avatar Group
              </h4>
              <AvatarGroup
                avatars={[
                  { name: 'Alice Cooper' },
                  { name: 'Bob Dylan' },
                  { name: 'Charlie Parker' },
                  { name: 'Diana Ross' },
                ]}
              />
            </div>

            {/* With Max Limit */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Max 3 Avatars (7 Total)
              </h4>
              <AvatarGroup
                max={3}
                avatars={[
                  { name: 'User 1' },
                  { name: 'User 2' },
                  { name: 'User 3' },
                  { name: 'User 4' },
                  { name: 'User 5' },
                  { name: 'User 6' },
                  { name: 'User 7' },
                ]}
                onOverflowClick={() => console.log('Show all users')}
              />
            </div>

            {/* With Total Count */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                With Total Count
              </h4>
              <AvatarGroup
                max={4}
                showTotal
                avatars={[
                  { name: 'Team Member 1', status: 'online' },
                  { name: 'Team Member 2', status: 'away' },
                  { name: 'Team Member 3', status: 'busy' },
                  { name: 'Team Member 4', status: 'offline' },
                  { name: 'Team Member 5' },
                ]}
              />
            </div>

            {/* Different Sizes */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Different Sizes
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <AvatarGroup
                  size="sm"
                  avatars={[{ name: 'A' }, { name: 'B' }, { name: 'C' }]}
                />
                <AvatarGroup
                  size="md"
                  avatars={[{ name: 'A' }, { name: 'B' }, { name: 'C' }]}
                />
                <AvatarGroup
                  size="lg"
                  avatars={[{ name: 'A' }, { name: 'B' }, { name: 'C' }]}
                />
              </div>
            </div>
          </div>
        </Section>

        {/* ProgressBar Section - NEW PHASE 4 */}
        <Section title="ProgressBar Component (Phase 4)" description="Linear and circular progress indicators">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Linear Progress */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Linear Progress
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <ProgressBar value={progress} showLabel label="Upload Progress" />
                <ProgressBar value={75} color="success" />
                <ProgressBar value={50} color="warning" size="small" />
                <ProgressBar value={undefined} /> {/* Indeterminate */}
              </div>
              <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
                <Button variant="primary" onClick={() => setProgress(Math.min(100, progress + 10))}>
                  Increase
                </Button>
                <Button variant="secondary" onClick={() => setProgress(Math.max(0, progress - 10))}>
                  Decrease
                </Button>
                <Button variant="secondary" onClick={() => setProgress(0)}>
                  Reset
                </Button>
              </div>
            </div>

            {/* Circular Progress */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Circular Progress
              </h4>
              <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
                <ProgressBar variant="circular" value={progress} showLabel />
                <ProgressBar variant="circular" value={85} color="success" size="small" />
                <ProgressBar variant="circular" value={undefined} color="primary" /> {/* Indeterminate */}
                <ProgressBar variant="circular" value={progress} showLabel label="Loading..." />
              </div>
            </div>

            {/* Different Colors */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Color Variants
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <ProgressBar value={60} color="primary" showLabel label="Primary" />
                <ProgressBar value={75} color="success" showLabel label="Success" />
                <ProgressBar value={45} color="warning" showLabel label="Warning" />
                <ProgressBar value={30} color="error" showLabel label="Error" />
              </div>
            </div>
          </div>
        </Section>

        {/* Skeleton Section - NEW PHASE 4 */}
        <Section title="Skeleton Component (Phase 4)" description="Loading placeholders for content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Basic Skeletons */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Basic Shapes
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <Skeleton variant="text" />
                <Skeleton variant="rectangular" height="100px" />
                <Skeleton variant="circular" width="50px" height="50px" />
                <Skeleton variant="rounded" height="150px" />
              </div>
            </div>

            {/* Animation Types */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Animation Variants
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <p style={{ fontSize: 'var(--text-caption-size)', marginBottom: 'var(--space-2)' }}>Pulse (default)</p>
                  <Skeleton variant="rectangular" height="60px" animation="pulse" />
                </div>
                <div>
                  <p style={{ fontSize: 'var(--text-caption-size)', marginBottom: 'var(--space-2)' }}>Wave</p>
                  <Skeleton variant="rectangular" height="60px" animation="wave" />
                </div>
                <div>
                  <p style={{ fontSize: 'var(--text-caption-size)', marginBottom: 'var(--space-2)' }}>None</p>
                  <Skeleton variant="rectangular" height="60px" animation="none" />
                </div>
              </div>
            </div>

            {/* Preset Skeletons */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Preset Components
              </h4>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Button variant={showSkeleton ? 'primary' : 'secondary'} onClick={() => setShowSkeleton(!showSkeleton)}>
                  {showSkeleton ? 'Hide Skeletons' : 'Show Skeletons'}
                </Button>
              </div>
              {showSkeleton && (
                <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  <div>
                    <p style={{ fontSize: 'var(--text-caption-size)', marginBottom: 'var(--space-3)' }}>Text Lines</p>
                    <SkeletonText lines={3} />
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--text-caption-size)', marginBottom: 'var(--space-3)' }}>Card</p>
                    <SkeletonCard />
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--text-caption-size)', marginBottom: 'var(--space-3)' }}>Avatar</p>
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                      <SkeletonAvatar size="40px" />
                      <SkeletonAvatar size="56px" />
                      <SkeletonAvatar size="80px" />
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--text-caption-size)', marginBottom: 'var(--space-3)' }}>Table</p>
                    <SkeletonTable rows={3} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* Popover Section - NEW PHASE 4 */}
        <Section title="Popover Component (Phase 4)" description="Floating content panels">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Position Variants */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Position Variants
              </h4>
              <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
                <Popover
                  trigger={<Button variant="secondary">Top Popover</Button>}
                  content={
                    <div>
                      <strong>Top Position</strong>
                      <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-caption-size)' }}>
                        This popover appears above the trigger.
                      </p>
                    </div>
                  }
                  position="top"
                />
                <Popover
                  trigger={<Button variant="secondary">Bottom Popover</Button>}
                  content={
                    <div>
                      <strong>Bottom Position</strong>
                      <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-caption-size)' }}>
                        This popover appears below the trigger.
                      </p>
                    </div>
                  }
                  position="bottom"
                />
                <Popover
                  trigger={<Button variant="secondary">Left Popover</Button>}
                  content={
                    <div>
                      <strong>Left Position</strong>
                      <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-caption-size)' }}>
                        Appears on the left.
                      </p>
                    </div>
                  }
                  position="left"
                />
                <Popover
                  trigger={<Button variant="secondary">Right Popover</Button>}
                  content={
                    <div>
                      <strong>Right Position</strong>
                      <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-caption-size)' }}>
                        Appears on the right.
                      </p>
                    </div>
                  }
                  position="right"
                />
              </div>
            </div>

            {/* Trigger Modes */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Trigger Modes
              </h4>
              <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
                <Popover
                  trigger={<Button variant="primary">Click to Open</Button>}
                  content={
                    <div>
                      <strong>Click Trigger</strong>
                      <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-caption-size)' }}>
                        Click the button to toggle this popover.
                      </p>
                    </div>
                  }
                  triggerMode="click"
                />
                <Popover
                  trigger={<Button variant="secondary">Hover to Open</Button>}
                  content={
                    <div>
                      <strong>Hover Trigger</strong>
                      <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-caption-size)' }}>
                        Hover over the button to see this popover.
                      </p>
                    </div>
                  }
                  triggerMode="hover"
                />
              </div>
            </div>

            {/* Rich Content */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Rich Content Example
              </h4>
              <Popover
                trigger={<Button variant="primary">User Profile</Button>}
                content={
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                      <Avatar name="John Doe" size="md" status="online" />
                      <div>
                        <strong>John Doe</strong>
                        <p style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-gray-400)' }}>
                          Senior Developer
                        </p>
                      </div>
                    </div>
                    <div style={{ fontSize: 'var(--text-caption-size)' }}>
                      <p>Email: john.doe@example.com</p>
                      <p>Location: San Francisco, CA</p>
                    </div>
                  </div>
                }
                position="bottom"
              />
            </div>
          </div>
        </Section>

        {/* Snackbar Section - NEW PHASE 4 */}
        <Section title="Snackbar Component (Phase 4)" description="Bottom notifications with actions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Variant Buttons */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Trigger Snackbar Variants
              </h4>
              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSnackbarVariant('default');
                    setShowSnackbar(true);
                  }}
                >
                  Default Snackbar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSnackbarVariant('success');
                    setShowSnackbar(true);
                  }}
                >
                  Success Snackbar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSnackbarVariant('error');
                    setShowSnackbar(true);
                  }}
                >
                  Error Snackbar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSnackbarVariant('warning');
                    setShowSnackbar(true);
                  }}
                >
                  Warning Snackbar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSnackbarVariant('info');
                    setShowSnackbar(true);
                  }}
                >
                  Info Snackbar
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-gray-100)',
              borderRadius: 'var(--radius-md)',
            }}>
              <p style={{ fontSize: 'var(--text-body-size)', color: 'var(--color-gray-700)' }}>
                💡 Click any button above to trigger a snackbar notification at the bottom of the screen.
                Snackbars auto-dismiss after 5 seconds or can be manually closed.
              </p>
            </div>
          </div>
        </Section>

        {/* Phase 5: Data Display */}
        <Section title="List Component (Phase 5)" description="Versatile list displays">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Basic ListItem */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                List Items
              </h4>
              <List>
                <ListItem icon={<IconHome />}>Home Dashboard</ListItem>
                <ListItem icon={<IconUser />} secondaryText="Manage team members">
                  User Management
                </ListItem>
                <ListItem icon={<IconSettings />} secondaryText="Configure application" onClick={() => alert('Settings clicked')}>
                  Settings
                </ListItem>
                <ListItem icon={<IconCalendar />} disabled>
                  Calendar (Coming Soon)
                </ListItem>
              </List>
            </div>

            {/* Ordered and Unordered */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Ordered & Unordered Lists
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                <div>
                  <div style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-caption-size)', color: 'var(--color-gray-600)' }}>
                    Ordered List
                  </div>
                  <OrderedList items={[
                    'First item in sequence',
                    'Second item follows',
                    'Third item completes'
                  ]} />
                </div>
                <div>
                  <div style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-caption-size)', color: 'var(--color-gray-600)' }}>
                    Unordered List
                  </div>
                  <UnorderedList items={[
                    'Bullet point one',
                    'Bullet point two',
                    'Bullet point three'
                  ]} />
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Stat Component (Phase 5)" description="Metrics display cards">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Color Variants */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Stat Cards with Trends
              </h4>
              <StatGrid>
                <Stat
                  label="Total Revenue"
                  value="$45,231"
                  trend="up"
                  trendValue="+12%"
                  color="success"
                />
                <Stat
                  label="Active Users"
                  value="2,458"
                  trend="up"
                  trendValue="+8%"
                  color="primary"
                />
                <Stat
                  label="Conversion Rate"
                  value="3.2%"
                  trend="down"
                  trendValue="-2%"
                  color="warning"
                />
                <Stat
                  label="Error Rate"
                  value="0.4%"
                  trend="down"
                  trendValue="-5%"
                  color="error"
                />
              </StatGrid>
            </div>

            {/* Size Variants */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Size Variants
              </h4>
              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <Stat
                  label="Default Size"
                  value="1,234"
                  trend="up"
                  size="default"
                />
                <Stat
                  label="Large Size"
                  value="5,678"
                  trend="up"
                  size="large"
                  color="primary"
                />
              </div>
            </div>
          </div>
        </Section>

        <Section title="KPI Component (Phase 5)" description="Dashboard KPI widgets">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Status Variants */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                KPI Status Indicators
              </h4>
              <KPIGrid>
                <KPI
                  title="Sales Target"
                  current={87}
                  target={100}
                  unit="K"
                  trend="up"
                  trendPercentage={5}
                  status="success"
                  showProgress
                />
                <KPI
                  title="Project Completion"
                  current={68}
                  target={100}
                  unit="%"
                  trend="up"
                  trendPercentage={3}
                  status="warning"
                  showProgress
                />
                <KPI
                  title="Bug Resolution"
                  current={42}
                  target={100}
                  unit="%"
                  trend="down"
                  trendPercentage={2}
                  status="error"
                  showProgress
                />
              </KPIGrid>
            </div>
          </div>
        </Section>

        <Section title="Divider Component (Phase 5)" description="Visual separators">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Horizontal Variants */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Horizontal Dividers
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <div>
                  <div style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-caption-size)', color: 'var(--color-gray-600)' }}>
                    Solid (default)
                  </div>
                  <Divider />
                </div>
                <div>
                  <div style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-caption-size)', color: 'var(--color-gray-600)' }}>
                    Dashed
                  </div>
                  <Divider variant="dashed" />
                </div>
                <div>
                  <div style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-caption-size)', color: 'var(--color-gray-600)' }}>
                    Dotted
                  </div>
                  <Divider variant="dotted" />
                </div>
                <div>
                  <div style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-caption-size)', color: 'var(--color-gray-600)' }}>
                    With Label (Center)
                  </div>
                  <Divider label="OR" labelPosition="center" />
                </div>
              </div>
            </div>

            {/* Vertical Divider */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Vertical Divider
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', height: '100px' }}>
                <div>Section 1</div>
                <Divider orientation="vertical" />
                <div>Section 2</div>
                <Divider orientation="vertical" variant="dashed" />
                <div>Section 3</div>
              </div>
            </div>
          </div>
        </Section>

        {/* Phase 6: Advanced Interactions */}
        <Section title="Timeline Component (Phase 6)" description="Event sequences and activity feeds">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Basic Timeline */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Activity Timeline
              </h4>
              <Timeline>
                <TimelineItem
                  timestamp="2 hours ago"
                  icon={<IconCheck size={18} />}
                  color="success"
                >
                  <strong>Deployment successful</strong>
                  <p style={{ fontSize: 'var(--text-caption-size)', marginTop: 'var(--space-1)', color: 'var(--color-gray-600)' }}>
                    Application v2.4.0 deployed to production
                  </p>
                </TimelineItem>
                <TimelineItem
                  timestamp="5 hours ago"
                  icon={<IconUser size={18} />}
                  color="primary"
                >
                  <strong>New team member added</strong>
                  <p style={{ fontSize: 'var(--text-caption-size)', marginTop: 'var(--space-1)', color: 'var(--color-gray-600)' }}>
                    Sarah Johnson joined the development team
                  </p>
                </TimelineItem>
                <TimelineItem
                  timestamp="1 day ago"
                  icon={<IconSettings size={18} />}
                  color="warning"
                >
                  <strong>Configuration updated</strong>
                  <p style={{ fontSize: 'var(--text-caption-size)', marginTop: 'var(--space-1)', color: 'var(--color-gray-600)' }}>
                    Database connection pool size increased
                  </p>
                </TimelineItem>
                <TimelineItem
                  timestamp="3 days ago"
                  color="default"
                >
                  Project kickoff meeting completed
                </TimelineItem>
              </Timeline>
            </div>
          </div>
        </Section>

        <Section title="Accordion Component (Phase 6)" description="Collapsible content panels">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Basic Accordion */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                FAQ Accordion
              </h4>
              <Accordion>
                <AccordionItem
                  title="What is Quantum Obsidian?"
                  icon={<IconInfo size={20} />}
                  defaultExpanded
                >
                  Quantum Obsidian is a comprehensive design system built on Material Design 3 principles.
                  It provides a complete set of components, design tokens, and patterns for building
                  modern web applications with a focus on accessibility and developer experience.
                </AccordionItem>
                <AccordionItem
                  title="How do I customize the theme?"
                  icon={<IconSettings size={20} />}
                >
                  Customize the theme by modifying CSS custom properties (design tokens) in your global
                  styles. All color, spacing, and typography values are defined as CSS variables for
                  easy theming and dark mode support.
                </AccordionItem>
                <AccordionItem
                  title="Is TypeScript required?"
                  icon={<IconInfo size={20} />}
                >
                  While not strictly required, TypeScript is highly recommended for the best development
                  experience. All components are fully typed with comprehensive prop interfaces and
                  strict type checking enabled.
                </AccordionItem>
                <AccordionItem
                  title="Can I use this in production?"
                  icon={<IconCheck size={20} />}
                >
                  Yes! All components are production-ready with zero build errors, comprehensive testing,
                  and full documentation. The library follows semantic versioning and maintains backward
                  compatibility.
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </Section>

        <Section title="Tooltip Component (Phase 6)" description="Rich tooltips with positioning">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Position Variants */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Tooltip Positions
              </h4>
              <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', padding: 'var(--space-10)' }}>
                <Tooltip content="This tooltip appears on top" position="top">
                  <Button variant="secondary">Top Tooltip</Button>
                </Tooltip>
                <Tooltip content="This tooltip appears on bottom" position="bottom">
                  <Button variant="secondary">Bottom Tooltip</Button>
                </Tooltip>
                <Tooltip content="This tooltip appears on left" position="left">
                  <Button variant="secondary">Left Tooltip</Button>
                </Tooltip>
                <Tooltip content="This tooltip appears on right" position="right">
                  <Button variant="secondary">Right Tooltip</Button>
                </Tooltip>
              </div>
            </div>

            {/* Rich Content */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Rich Content Tooltip
              </h4>
              <div style={{ padding: 'var(--space-6)' }}>
                <Tooltip
                  content={
                    <div>
                      <strong>User Information</strong>
                      <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--text-caption-size)' }}>
                        Name: John Doe<br />
                        Role: Senior Developer<br />
                        Status: Available
                      </p>
                    </div>
                  }
                  position="right"
                >
                  <Avatar name="John Doe" size="lg" status="online" />
                </Tooltip>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Pagination Component (Phase 6)" description="Page navigation controls">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Basic Pagination */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Basic Pagination
              </h4>
              <Pagination
                currentPage={currentPage}
                totalPages={20}
                onPageChange={setCurrentPage}
              />
            </div>

            {/* With Page Size Selector */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                With Page Size & Total Count
              </h4>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(243 / pageSize)}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                showPageSize
                showTotal
                totalItems={243}
              />
            </div>

            {/* Compact Pagination */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Compact (Few Pages)
              </h4>
              <Pagination
                currentPage={1}
                totalPages={5}
                onPageChange={() => {}}
              />
            </div>
          </div>
        </Section>

        {/* PHASE 7: Slider Component */}
        <Section title="Slider Component (Phase 7)" description="Range input control with draggable thumb">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Basic Slider */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Basic Slider (Value: {sliderValue})
              </h4>
              <Slider
                value={sliderValue}
                onChange={(val) => setSliderValue(val)}
                min={0}
                max={100}
                step={1}
              />
            </div>

            {/* Color Variants */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Color Variants
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <Slider defaultValue={30} color="primary" showValue />
                <Slider defaultValue={50} color="success" showValue />
                <Slider defaultValue={70} color="warning" showValue />
                <Slider defaultValue={90} color="error" showValue />
              </div>
            </div>

            {/* With Marks */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                With Marks & Custom Steps
              </h4>
              <Slider
                defaultValue={50}
                min={0}
                max={100}
                step={25}
                showMarks
                showValue
                marks={[
                  { value: 0, label: 'Min' },
                  { value: 25, label: '25%' },
                  { value: 50, label: 'Half' },
                  { value: 75, label: '75%' },
                  { value: 100, label: 'Max' },
                ]}
              />
            </div>

            {/* Disabled */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Disabled Slider
              </h4>
              <Slider defaultValue={60} disabled showValue />
            </div>
          </div>
        </Section>

        {/* PHASE 7: ColorPicker Component */}
        <Section title="ColorPicker Component (Phase 7)" description="HSL color selection with presets">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Basic ColorPicker */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Basic Color Picker (Selected: {colorValue})
              </h4>
              <ColorPicker
                value={colorValue}
                onChange={(color) => setColorValue(color.hex)}
              />
            </div>

            {/* Custom Presets */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                With Custom Preset Colors
              </h4>
              <ColorPicker
                defaultValue="#10b981"
                presets={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']}
                onChange={(color) => console.log('Color changed:', color)}
              />
            </div>

            {/* Disabled */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Disabled Color Picker
              </h4>
              <ColorPicker defaultValue="#f59e0b" disabled />
            </div>
          </div>
        </Section>

        {/* PHASE 7: TreeView Component */}
        <Section title="TreeView Component (Phase 7)" description="Hierarchical tree structure">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Basic TreeView */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Basic Tree (Expandable)
              </h4>
              <TreeView
                data={[
                  {
                    key: 'root1',
                    label: 'Documents',
                    icon: <IconHome size={16} />,
                    children: [
                      { key: 'doc1', label: 'Resume.pdf' },
                      { key: 'doc2', label: 'Cover Letter.docx' },
                      {
                        key: 'folder1',
                        label: 'Projects',
                        children: [
                          { key: 'proj1', label: 'Project A' },
                          { key: 'proj2', label: 'Project B' },
                        ],
                      },
                    ],
                  },
                  {
                    key: 'root2',
                    label: 'Images',
                    icon: <IconCalendar size={16} />,
                    children: [
                      { key: 'img1', label: 'photo1.jpg' },
                      { key: 'img2', label: 'photo2.png' },
                    ],
                  },
                ]}
                onSelect={(node) => console.log('Selected:', node)}
              />
            </div>

            {/* With Checkboxes */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Tree with Checkboxes
              </h4>
              <TreeView
                data={[
                  {
                    key: 'features',
                    label: 'Features',
                    children: [
                      { key: 'auth', label: 'Authentication' },
                      { key: 'api', label: 'API Integration' },
                      { key: 'ui', label: 'User Interface', disabled: true },
                    ],
                  },
                ]}
                showCheckboxes
                defaultExpanded={['features']}
                onSelect={(node) => console.log('Checked:', node)}
              />
            </div>
          </div>
        </Section>

        {/* PHASE 7: Transfer Component */}
        <Section title="Transfer Component (Phase 7)" description="Dual-list selection for moving items">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Basic Transfer */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Basic Transfer (Source: {sourceItems.length}, Target: {targetItems.length})
              </h4>
              <Transfer
                sourceItems={sourceItems}
                targetItems={targetItems}
                onChange={(newSource, newTarget) => {
                  setSourceItems(newSource);
                  setTargetItems(newTarget);
                }}
                titles={['Available Languages', 'Selected Frameworks']}
                showSearch
              />
            </div>

            {/* Without Search */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Transfer Without Search
              </h4>
              <Transfer
                sourceItems={[
                  { key: 'a', label: 'Item A' },
                  { key: 'b', label: 'Item B' },
                  { key: 'c', label: 'Item C' },
                ]}
                targetItems={[]}
                showSearch={false}
              />
            </div>
          </div>
        </Section>

        {/* PHASE 8: DataTable Component */}
        <Section title="DataTable Component (Phase 8)" description="Sortable, filterable data table">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Basic DataTable */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Employee Data Table
              </h4>
              <DataTable
                columns={[
                  {
                    key: 'id',
                    header: 'ID',
                    accessor: (row: any) => row.id,
                    sortable: true,
                    width: '80px',
                  },
                  {
                    key: 'name',
                    header: 'Name',
                    accessor: (row: any) => row.name,
                    sortable: true,
                  },
                  {
                    key: 'role',
                    header: 'Role',
                    accessor: (row: any) => row.role,
                    sortable: true,
                  },
                  {
                    key: 'department',
                    header: 'Department',
                    accessor: (row: any) => row.department,
                    sortable: true,
                  },
                  {
                    key: 'salary',
                    header: 'Salary',
                    accessor: (row: any) => `$${row.salary.toLocaleString()}`,
                    sortable: true,
                    align: 'right',
                  },
                ]}
                data={[
                  { id: 1, name: 'Alice Johnson', role: 'Engineer', department: 'Engineering', salary: 95000 },
                  { id: 2, name: 'Bob Smith', role: 'Designer', department: 'Design', salary: 85000 },
                  { id: 3, name: 'Charlie Brown', role: 'Manager', department: 'Operations', salary: 110000 },
                  { id: 4, name: 'Diana Prince', role: 'Engineer', department: 'Engineering', salary: 98000 },
                  { id: 5, name: 'Eve Davis', role: 'Analyst', department: 'Finance', salary: 78000 },
                  { id: 6, name: 'Frank Miller', role: 'Engineer', department: 'Engineering', salary: 92000 },
                  { id: 7, name: 'Grace Lee', role: 'Designer', department: 'Design', salary: 87000 },
                  { id: 8, name: 'Henry Wilson', role: 'Manager', department: 'Sales', salary: 105000 },
                  { id: 9, name: 'Iris Chen', role: 'Engineer', department: 'Engineering', salary: 96000 },
                  { id: 10, name: 'Jack Taylor', role: 'Analyst', department: 'Finance', salary: 82000 },
                  { id: 11, name: 'Kelly Martin', role: 'Designer', department: 'Design', salary: 89000 },
                  { id: 12, name: 'Leo Anderson', role: 'Engineer', department: 'Engineering', salary: 99000 },
                ]}
                keyExtractor={(row) => row.id.toString()}
                onRowClick={(row) => console.log('Clicked:', row)}
                sortable
                filterable
                pagination
                defaultPageSize={5}
                striped
                hoverable
              />
            </div>
          </div>
        </Section>

        {/* PHASE 8: TablePagination Component */}
        <Section title="TablePagination Component (Phase 8)" description="Advanced pagination for tables">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Basic Pagination */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Full-Featured Table Pagination (Page {tablePage} of 10)
              </h4>
              <TablePagination
                currentPage={tablePage}
                totalPages={10}
                totalItems={243}
                pageSize={tablePageSize}
                pageSizeOptions={[5, 10, 25, 50]}
                onPageChange={(page) => setTablePage(page)}
                onPageSizeChange={(size) => {
                  setTablePageSize(size);
                  setTablePage(1);
                }}
                showFirstLast
                maxPageButtons={7}
              />
            </div>

            {/* Compact Pagination */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Compact Pagination (No Page Size Selector)
              </h4>
              <TablePagination
                currentPage={2}
                totalPages={5}
                totalItems={48}
                pageSize={10}
                onPageChange={(page) => console.log('Page changed:', page)}
                showFirstLast={false}
                maxPageButtons={5}
              />
            </div>
          </div>
        </Section>

        {/* PHASE 8: VirtualList Component */}
        <Section title="VirtualList Component (Phase 8)" description="Performance-optimized list rendering">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Virtual List */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Virtual List (1,000 items, only renders visible)
              </h4>
              <VirtualList
                items={Array.from({ length: 1000 }, (_, i) => ({
                  id: i + 1,
                  title: `Item ${i + 1}`,
                  description: `Description for item ${i + 1}`,
                }))}
                itemHeight={60}
                containerHeight={400}
                renderItem={(item) => (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    <div style={{ fontSize: 'var(--text-body-size)', fontWeight: 600, color: 'var(--color-gray-900)' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-gray-600)' }}>
                      {item.description}
                    </div>
                  </div>
                )}
                keyExtractor={(item) => item.id.toString()}
                overscan={5}
              />
            </div>
          </div>
        </Section>

        {/* PHASE 8: Calendar Component */}
        <Section title="Calendar Component (Phase 8)" description="Date selection with month/year navigation">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Basic Calendar */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Basic Calendar (Selected: {calendarDate.toLocaleDateString()})
              </h4>
              <Calendar
                value={calendarDate}
                onChange={(date) => setCalendarDate(date)}
              />
            </div>

            {/* Calendar with Week Numbers */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Calendar with Week Numbers
              </h4>
              <Calendar
                defaultValue={new Date()}
                showWeekNumbers
                onChange={(date) => console.log('Selected:', date)}
              />
            </div>

            {/* Calendar with Highlighted Dates */}
            <div>
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-size)', fontWeight: 600 }}>
                Calendar with Highlighted & Disabled Dates
              </h4>
              <Calendar
                defaultValue={new Date()}
                highlightedDates={[
                  new Date(2026, 0, 5),
                  new Date(2026, 0, 15),
                  new Date(2026, 0, 25),
                ]}
                disabledDates={[
                  new Date(2026, 0, 10),
                  new Date(2026, 0, 20),
                ]}
                onChange={(date) => console.log('Selected:', date)}
              />
            </div>
          </div>
        </Section>

        {/* Snackbar Component (rendered at bottom) */}
        <Snackbar
          open={showSnackbar}
          message={`This is a ${snackbarVariant} snackbar notification!`}
          variant={snackbarVariant}
          position="bottom-left"
          onClose={() => setShowSnackbar(false)}
          autoHideDuration={5000}
          action={
            <Button
              variant="secondary"
              onClick={() => console.log('Action clicked')}
              style={{
                fontSize: 'var(--text-caption-size)',
                padding: 'var(--space-1) var(--space-2)',
                color: 'var(--color-white)',
              }}
            >
              Undo
            </Button>
          }
        />
      </div>

      {/* PHASE 9: Carousel Component */}
      <Section title="Carousel Component (Phase 9)" description="Image/content slider with autoplay and navigation">
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          {/* Basic Carousel */}
          <div>
            <h4 style={{ fontSize: 'var(--text-subtitle-size)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              Basic Carousel
            </h4>
            <Carousel
              slides={[
                { id: '1', content: <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--color-primary)', color: 'white', textAlign: 'center', fontSize: '24px' }}>Slide 1</div> },
                { id: '2', content: <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--color-secondary)', color: 'white', textAlign: 'center', fontSize: '24px' }}>Slide 2</div> },
                { id: '3', content: <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--color-success)', color: 'white', textAlign: 'center', fontSize: '24px' }}>Slide 3</div> },
                { id: '4', content: <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--color-warning)', color: 'white', textAlign: 'center', fontSize: '24px' }}>Slide 4</div> },
                { id: '5', content: <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--color-error)', color: 'white', textAlign: 'center', fontSize: '24px' }}>Slide 5</div> },
              ]}
              height="300px"
              loop
            />
          </div>

          {/* Autoplay Carousel */}
          <div>
            <h4 style={{ fontSize: 'var(--text-subtitle-size)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              Autoplay Carousel (5s interval)
            </h4>
            <Carousel
              slides={[
                { id: '1', content: <div style={{ padding: 'var(--space-6)', backgroundColor: '#6366f1', color: 'white', textAlign: 'center', fontSize: '20px' }}>Auto 1</div> },
                { id: '2', content: <div style={{ padding: 'var(--space-6)', backgroundColor: '#8b5cf6', color: 'white', textAlign: 'center', fontSize: '20px' }}>Auto 2</div> },
                { id: '3', content: <div style={{ padding: 'var(--space-6)', backgroundColor: '#ec4899', color: 'white', textAlign: 'center', fontSize: '20px' }}>Auto 3</div> },
              ]}
              autoplay
              autoplayInterval={5000}
              height="250px"
              loop
            />
          </div>

          {/* Carousel without indicators */}
          <div>
            <h4 style={{ fontSize: 'var(--text-subtitle-size)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              No Indicators
            </h4>
            <Carousel
              slides={[
                { id: '1', content: <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--color-gray-700)', color: 'white', textAlign: 'center' }}>Slide A</div> },
                { id: '2', content: <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--color-gray-600)', color: 'white', textAlign: 'center' }}>Slide B</div> },
              ]}
              showIndicators={false}
              height="200px"
              loop
            />
          </div>
        </div>
      </Section>

      {/* PHASE 9: ImageGallery Component */}
      <Section title="ImageGallery Component (Phase 9)" description="Grid gallery with lightbox modal">
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          {/* Basic Gallery */}
          <div>
            <h4 style={{ fontSize: 'var(--text-subtitle-size)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              3-Column Gallery
            </h4>
            <ImageGallery
              images={[
                { id: '1', src: 'https://picsum.photos/800/600?random=1', alt: 'Image 1', title: 'Nature Scene', description: 'Beautiful landscape' },
                { id: '2', src: 'https://picsum.photos/800/600?random=2', alt: 'Image 2', title: 'City View', description: 'Urban architecture' },
                { id: '3', src: 'https://picsum.photos/800/600?random=3', alt: 'Image 3', title: 'Sunset', description: 'Golden hour' },
                { id: '4', src: 'https://picsum.photos/800/600?random=4', alt: 'Image 4', title: 'Ocean', description: 'Blue waters' },
                { id: '5', src: 'https://picsum.photos/800/600?random=5', alt: 'Image 5', title: 'Mountains', description: 'Peak views' },
                { id: '6', src: 'https://picsum.photos/800/600?random=6', alt: 'Image 6', title: 'Forest', description: 'Green trees' },
              ]}
              columns={3}
              gap="var(--space-4)"
            />
          </div>

          {/* 4-Column Gallery */}
          <div>
            <h4 style={{ fontSize: 'var(--text-subtitle-size)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              4-Column Gallery
            </h4>
            <ImageGallery
              images={[
                { id: '7', src: 'https://picsum.photos/800/600?random=7', alt: 'Image 7' },
                { id: '8', src: 'https://picsum.photos/800/600?random=8', alt: 'Image 8' },
                { id: '9', src: 'https://picsum.photos/800/600?random=9', alt: 'Image 9' },
                { id: '10', src: 'https://picsum.photos/800/600?random=10', alt: 'Image 10' },
              ]}
              columns={4}
              gap="var(--space-3)"
            />
          </div>
        </div>
      </Section>

      {/* PHASE 9: TimelineAdvanced Component */}
      <Section title="TimelineAdvanced Component (Phase 9)" description="Enhanced timeline with media and expandable content">
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          {/* Project Timeline */}
          <div>
            <h4 style={{ fontSize: 'var(--text-subtitle-size)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              Project Timeline with Media
            </h4>
            <TimelineAdvanced
              items={[
                {
                  id: '1',
                  timestamp: new Date('2024-01-15T10:00:00'),
                  title: 'Project Kickoff',
                  description: 'Initial planning and team alignment meeting completed.',
                  variant: 'primary',
                },
                {
                  id: '2',
                  timestamp: new Date('2024-01-20T14:30:00'),
                  title: 'Design Phase Complete',
                  description: 'UI/UX designs approved by stakeholders.',
                  content: 'Detailed wireframes and mockups were created for all major user flows. The design system was established with color schemes, typography, and component guidelines.',
                  media: [
                    { type: 'image', src: 'https://picsum.photos/800/450?random=11', alt: 'Design mockup' },
                    { type: 'image', src: 'https://picsum.photos/800/450?random=12', alt: 'Component library' },
                  ],
                  expandable: true,
                  variant: 'success',
                },
                {
                  id: '3',
                  timestamp: new Date('2024-02-01T09:00:00'),
                  title: 'Development Started',
                  description: 'Frontend and backend development in progress.',
                  content: 'Development team is working on implementing the approved designs using React and Next.js for the frontend, with Node.js and PostgreSQL on the backend.',
                  expandable: true,
                  variant: 'warning',
                },
                {
                  id: '4',
                  timestamp: new Date('2024-02-15T16:00:00'),
                  title: 'Beta Testing',
                  description: 'Internal testing phase with selected users.',
                  media: [
                    { type: 'image', src: 'https://picsum.photos/800/450?random=13', alt: 'Testing dashboard' },
                  ],
                  variant: 'default',
                },
              ]}
              showIcons
            />
          </div>

          {/* Simple Timeline */}
          <div>
            <h4 style={{ fontSize: 'var(--text-subtitle-size)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              Simple Status Timeline
            </h4>
            <TimelineAdvanced
              items={[
                {
                  id: '5',
                  timestamp: new Date('2024-01-10T08:00:00'),
                  title: 'Order Placed',
                  description: 'Your order has been received.',
                  variant: 'success',
                },
                {
                  id: '6',
                  timestamp: new Date('2024-01-11T10:30:00'),
                  title: 'Processing',
                  description: 'Order is being prepared for shipment.',
                  variant: 'primary',
                },
                {
                  id: '7',
                  timestamp: new Date('2024-01-12T15:00:00'),
                  title: 'Shipped',
                  description: 'Package is on its way.',
                  variant: 'warning',
                },
              ]}
              showIcons
            />
          </div>
        </div>
      </Section>

      {/* PHASE 9: RichTextEditor Component */}
      <Section title="RichTextEditor Component (Phase 9)" description="WYSIWYG content editor with formatting">
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          {/* Full Editor */}
          <div>
            <h4 style={{ fontSize: 'var(--text-subtitle-size)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              Full Editor
            </h4>
            <RichTextEditor
              value={editorContent}
              onChange={setEditorContent}
              placeholder="Start typing your content..."
              minHeight="300px"
            />
          </div>

          {/* Read-Only Editor */}
          <div>
            <h4 style={{ fontSize: 'var(--text-subtitle-size)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              Read-Only Mode
            </h4>
            <RichTextEditor
              value="<h2>Sample Content</h2><p>This editor is in <strong>read-only</strong> mode. You can view but not edit the content.</p><ul><li>Feature 1</li><li>Feature 2</li></ul>"
              readOnly
              showToolbar={false}
              minHeight="200px"
            />
          </div>

          {/* Compact Editor */}
          <div>
            <h4 style={{ fontSize: 'var(--text-subtitle-size)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              Compact Editor
            </h4>
            <RichTextEditor
              placeholder="Quick note..."
              minHeight="150px"
            />
          </div>
        </div>
      </Section>

      {/* PHASE 10: LineChart Component */}
      <Section title="LineChart Component (Phase 10)" description="Time series data visualization with multiple series">
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          {/* Single Series */}
          <div>
            <h4 style={{ fontSize: 'var(--text-subtitle-size)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              Single Series Line Chart
            </h4>
            <LineChart
              series={[{
                id: 'revenue',
                name: 'Revenue',
                data: [
                  { x: 0, y: 42 },
                  { x: 1, y: 55 },
                  { x: 2, y: 48 },
                  { x: 3, y: 68 },
                  { x: 4, y: 72 },
                  { x: 5, y: 85 },
                  { x: 6, y: 92 },
                ],
              }]}
              xAxisLabel="Months"
              yAxisLabel="Revenue ($K)"
              curve="smooth"
            />
          </div>

          {/* Multiple Series */}
          <div>
            <h4 style={{ fontSize: 'var(--text-subtitle-size)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              Multi-Series Comparison
            </h4>
            <LineChart
              series={[
                {
                  id: 'product-a',
                  name: 'Product A',
                  data: [
                    { x: 0, y: 30 },
                    { x: 1, y: 45 },
                    { x: 2, y: 38 },
                    { x: 3, y: 52 },
                    { x: 4, y: 65 },
                  ],
                },
                {
                  id: 'product-b',
                  name: 'Product B',
                  data: [
                    { x: 0, y: 20 },
                    { x: 1, y: 32 },
                    { x: 2, y: 42 },
                    { x: 3, y: 55 },
                    { x: 4, y: 68 },
                  ],
                  color: 'var(--color-secondary)',
                },
              ]}
              xAxisLabel="Quarter"
              yAxisLabel="Sales (Units)"
              curve="smooth"
            />
          </div>
        </div>
      </Section>

      {/* PHASE 10: BarChart Component */}
      <Section title="BarChart Component (Phase 10)" description="Categorical data comparison with bars">
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          {/* Vertical Bar Chart */}
          <div>
            <h4 style={{ fontSize: 'var(--text-subtitle-size)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              Vertical Bar Chart
            </h4>
            <BarChart
              data={[
                { category: 'Jan', value: 45 },
                { category: 'Feb', value: 62 },
                { category: 'Mar', value: 55 },
                { category: 'Apr', value: 78 },
                { category: 'May', value: 85 },
                { category: 'Jun', value: 92 },
              ]}
              xAxisLabel="Month"
              yAxisLabel="Sales"
            />
          </div>

          {/* Horizontal Bar Chart */}
          <div>
            <h4 style={{ fontSize: 'var(--text-subtitle-size)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              Horizontal Bar Chart
            </h4>
            <BarChart
              data={[
                { category: 'Marketing', value: 85, color: 'var(--color-primary)' },
                { category: 'Engineering', value: 72, color: 'var(--color-secondary)' },
                { category: 'Sales', value: 68, color: 'var(--color-success)' },
                { category: 'Support', value: 55, color: 'var(--color-warning)' },
                { category: 'Operations', value: 42, color: 'var(--color-error)' },
              ]}
              orientation="horizontal"
              xAxisLabel="Team Performance Score"
              yAxisLabel="Department"
            />
          </div>
        </div>
      </Section>

      {/* PHASE 10: PieChart Component */}
      <Section title="PieChart Component (Phase 10)" description="Proportion visualization with pie and donut charts">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-6)' }}>
          {/* Pie Chart */}
          <div>
            <h4 style={{ fontSize: 'var(--text-subtitle-size)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              Pie Chart
            </h4>
            <PieChart
              data={[
                { id: '1', label: 'Desktop', value: 450 },
                { id: '2', label: 'Mobile', value: 320 },
                { id: '3', label: 'Tablet', value: 180 },
                { id: '4', label: 'Other', value: 50 },
              ]}
              width={400}
              height={400}
            />
          </div>

          {/* Donut Chart */}
          <div>
            <h4 style={{ fontSize: 'var(--text-subtitle-size)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              Donut Chart
            </h4>
            <PieChart
              data={[
                { id: '1', label: 'Chrome', value: 650, color: '#4285f4' },
                { id: '2', label: 'Safari', value: 280, color: '#34a853' },
                { id: '3', label: 'Firefox', value: 150, color: '#fbbc04' },
                { id: '4', label: 'Edge', value: 120, color: '#ea4335' },
              ]}
              width={400}
              height={400}
              donut
              donutWidth={80}
            />
          </div>
        </div>
      </Section>

      {/* PHASE 10: Sparkline Component */}
      <Section title="Sparkline Component (Phase 10)" description="Compact inline charts for trends">
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          {/* Sparkline Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-gray-600)', marginBottom: 'var(--space-2)' }}>
                Revenue Trend
              </div>
              <div style={{ fontSize: 'var(--text-title-size)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                $12,450
              </div>
              <Sparkline
                data={[
                  { value: 42 },
                  { value: 55 },
                  { value: 48 },
                  { value: 68 },
                  { value: 72 },
                  { value: 85 },
                  { value: 92 },
                ]}
                width={150}
                height={40}
                trend="up"
              />
            </div>

            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-gray-600)', marginBottom: 'var(--space-2)' }}>
                User Growth
              </div>
              <div style={{ fontSize: 'var(--text-title-size)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                8,234
              </div>
              <Sparkline
                data={[
                  { value: 85 },
                  { value: 75 },
                  { value: 68 },
                  { value: 52 },
                  { value: 48 },
                  { value: 38 },
                  { value: 32 },
                ]}
                width={150}
                height={40}
                trend="down"
              />
            </div>

            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-gray-600)', marginBottom: 'var(--space-2)' }}>
                Performance
              </div>
              <div style={{ fontSize: 'var(--text-title-size)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                94.5%
              </div>
              <Sparkline
                data={[
                  { value: 88 },
                  { value: 92 },
                  { value: 90 },
                  { value: 94 },
                  { value: 93 },
                  { value: 95 },
                  { value: 94 },
                ]}
                width={150}
                height={40}
                showDots
                color="var(--color-success)"
              />
            </div>
          </div>
        </div>
      </Section>
    </DashboardLayout>
  );
}

// Section Component
function Section({ title, description, children }: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      marginBottom: 'var(--space-10)',
      padding: 'var(--space-6)',
      backgroundColor: '#FFFFFF',
      border: '1px solid var(--color-gray-200)',
      borderRadius: 'var(--radius-xl)',
    }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{
          fontSize: 'var(--text-title-size)',
          fontWeight: 600,
          color: 'var(--color-gray-900)',
          marginBottom: 'var(--space-1)',
        }}>
          {title}
        </h2>
        <p style={{
          fontSize: 'var(--text-caption-size)',
          color: 'var(--color-gray-600)',
        }}>
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}
