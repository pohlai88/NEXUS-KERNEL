/**
 * Atoms - Barrel Export
 * Material Design 3 - Quantum Obsidian Design System
 */

// Primitives (default exports)
export { default as Button } from '../ui-primitives/Button';
export { default as Badge } from '../ui-primitives/Badge';

// Form Controls - Phase 1
export { Input } from './Input';
export { Checkbox } from './Checkbox';

// Form Controls - Phase 2
export { Radio, RadioGroup } from './Radio';
export type { RadioProps, RadioGroupProps } from './Radio';
export { Textarea } from './Textarea';
export type { TextareaProps } from './Textarea';
export { Switch } from './Switch';
export type { SwitchProps } from './Switch';
export { Chip } from './Chip';
export type { ChipProps } from './Chip';
export { DatePicker } from './DatePicker';
export type { DatePickerProps } from './DatePicker';
export { FileUpload } from './FileUpload';
export type { FileUploadProps } from './FileUpload';

// Identity - Phase 3
export { Avatar } from './Avatar';
export type { AvatarProps } from './Avatar';
export { AvatarGroup } from './AvatarGroup';
export type { AvatarGroupProps } from './AvatarGroup';
export { ProgressBar } from './ProgressBar';
export type { ProgressBarProps } from './ProgressBar';
export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar, SkeletonTable } from './Skeleton';
export type { SkeletonProps } from './Skeleton';
export { List, ListItem, OrderedList, UnorderedList } from './List';
export type { ListProps, ListItemProps, OrderedListProps, UnorderedListProps } from './List';
export { Stat, StatGrid } from './Stat';
export type { StatProps, StatGridProps } from './Stat';
export { Divider } from './Divider';
export type { DividerProps } from './Divider';
export { Timeline, TimelineItem } from './Timeline';
export type { TimelineProps, TimelineItemProps } from './Timeline';
export { Tooltip } from './Tooltip';
export type { TooltipProps } from './Tooltip';
export { Slider } from './Slider';
export type { SliderProps } from './Slider';
export { ColorPicker } from './ColorPicker';
export type { ColorPickerProps } from './ColorPicker';

// Feedback
export { Spinner } from './Spinner';

// Icons - Re-export all icons
export * from './icons';
