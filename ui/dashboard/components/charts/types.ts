/**
 * Chart Types - Material Design Data Visualizations
 * Based on Material Design principles with Quantum Obsidian design tokens
 */

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
    fill?: boolean;
  }[];
}

export interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

export interface PieChartData {
  data: ChartDataPoint[];
  centerText?: string;
}

export interface AreaChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
    gradientOpacity?: [number, number];
  }[];
}

export interface ChartCommonProps {
  title?: string;
  subtitle?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  animate?: boolean;
}
