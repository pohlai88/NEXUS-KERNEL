/**
 * MCP Efficiency Calculator
 * 
 * Calculates efficiency metrics for Next.js MCP integration
 * based on implementation rate, code quality, performance, and time savings.
 */

interface MCPEfficiencyMetrics {
  recommendationsTotal: number;
  recommendationsImplemented: number;
  codeQualityScore: number;
  performanceScore: number;
  timeSaved: number; // hours
  efficiencyScore: number; // 0-100
}

interface RecommendationStatus {
  priority: 'P0' | 'P1' | 'P2';
  total: number;
  implemented: number;
  pending: number;
}

interface CodeQualityMetrics {
  typescriptErrors: number;
  linterErrors: number;
  serverComponentsPercent: number;
  clientComponentsPercent: number;
  testCoverage: number;
  technicalDebt: number;
  accessibility: boolean;
}

interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint (ms)
  tti: number | null; // Time to Interactive (ms)
  lcp: number | null; // Largest Contentful Paint (ms)
  cls: number | null; // Cumulative Layout Shift
  fid: number | null; // First Input Delay (ms)
  bundleSize: number | null; // Bundle size (KB)
  serverComponentsPercent: number;
  clientComponentsPercent: number;
}

/**
 * Calculate implementation rate
 */
function calculateImplementationRate(
  p0: RecommendationStatus,
  p1: RecommendationStatus,
  p2: RecommendationStatus
): number {
  const total = p0.total + p1.total + p2.total;
  const implemented = p0.implemented + p1.implemented + p2.implemented;
  return total > 0 ? (implemented / total) * 100 : 0;
}

/**
 * Calculate code quality score
 */
function calculateCodeQualityScore(metrics: CodeQualityMetrics): number {
  let score = 0;
  let maxScore = 0;

  // TypeScript errors (target: 0)
  maxScore += 10;
  score += metrics.typescriptErrors === 0 ? 10 : 0;

  // Linter errors (target: 0)
  maxScore += 10;
  score += metrics.linterErrors === 0 ? 10 : 0;

  // Server Components (target: >80%)
  maxScore += 15;
  score += metrics.serverComponentsPercent >= 80 ? 15 : (metrics.serverComponentsPercent / 80) * 15;

  // Client Components (target: <20%)
  maxScore += 15;
  score += metrics.clientComponentsPercent <= 20 ? 15 : Math.max(0, 15 - ((metrics.clientComponentsPercent - 20) / 20) * 15);

  // Test Coverage (target: 95%)
  maxScore += 20;
  score += metrics.testCoverage >= 95 ? 20 : (metrics.testCoverage / 95) * 20;

  // Technical Debt (target: 0)
  maxScore += 15;
  score += metrics.technicalDebt === 0 ? 15 : Math.max(0, 15 - metrics.technicalDebt * 2);

  // Accessibility (target: compliant)
  maxScore += 15;
  score += metrics.accessibility ? 15 : 0;

  return maxScore > 0 ? (score / maxScore) * 100 : 0;
}

/**
 * Calculate performance score
 */
function calculatePerformanceScore(metrics: PerformanceMetrics): number {
  let score = 0;
  let measured = 0;
  let total = 8;

  // FCP (target: <2000ms)
  if (metrics.fcp !== null) {
    measured++;
    score += metrics.fcp < 2000 ? 12.5 : Math.max(0, 12.5 - ((metrics.fcp - 2000) / 2000) * 12.5);
  }

  // TTI (target: <3000ms)
  if (metrics.tti !== null) {
    measured++;
    score += metrics.tti < 3000 ? 12.5 : Math.max(0, 12.5 - ((metrics.tti - 3000) / 3000) * 12.5);
  }

  // LCP (target: <2500ms)
  if (metrics.lcp !== null) {
    measured++;
    score += metrics.lcp < 2500 ? 12.5 : Math.max(0, 12.5 - ((metrics.lcp - 2500) / 2500) * 12.5);
  }

  // CLS (target: <0.1)
  if (metrics.cls !== null) {
    measured++;
    score += metrics.cls < 0.1 ? 12.5 : Math.max(0, 12.5 - ((metrics.cls - 0.1) / 0.1) * 12.5);
  }

  // FID (target: <100ms)
  if (metrics.fid !== null) {
    measured++;
    score += metrics.fid < 100 ? 12.5 : Math.max(0, 12.5 - ((metrics.fid - 100) / 100) * 12.5);
  }

  // Bundle Size (target: <500KB)
  if (metrics.bundleSize !== null) {
    measured++;
    score += metrics.bundleSize < 500 ? 12.5 : Math.max(0, 12.5 - ((metrics.bundleSize - 500) / 500) * 12.5);
  }

  // Server Components (target: >80%)
  measured++;
  score += metrics.serverComponentsPercent >= 80 ? 12.5 : (metrics.serverComponentsPercent / 80) * 12.5;

  // Client Components (target: <20%)
  measured++;
  score += metrics.clientComponentsPercent <= 20 ? 12.5 : Math.max(0, 12.5 - ((metrics.clientComponentsPercent - 20) / 20) * 12.5);

  // Penalize for unmeasured metrics
  const measurementRate = measured / total;
  return (score / total) * measurementRate * 100;
}

/**
 * Calculate overall efficiency score
 */
export function calculateMCPEfficiency(
  recommendations: {
    p0: RecommendationStatus;
    p1: RecommendationStatus;
    p2: RecommendationStatus;
  },
  codeQuality: CodeQualityMetrics,
  performance: PerformanceMetrics,
  timeSaved: number
): MCPEfficiencyMetrics {
  const implementationRate = calculateImplementationRate(
    recommendations.p0,
    recommendations.p1,
    recommendations.p2
  );

  const codeQualityScore = calculateCodeQualityScore(codeQuality);
  const performanceScore = calculatePerformanceScore(performance);

  // Time efficiency (based on estimated time saved vs time spent)
  // Assuming 40 hours saved per audit cycle
  const timeEfficiency = Math.min(100, (timeSaved / 40) * 100);

  // Weighted efficiency score
  const efficiencyScore = (
    implementationRate * 0.30 +
    codeQualityScore * 0.30 +
    performanceScore * 0.20 +
    timeEfficiency * 0.20
  );

  return {
    recommendationsTotal: recommendations.p0.total + recommendations.p1.total + recommendations.p2.total,
    recommendationsImplemented: recommendations.p0.implemented + recommendations.p1.implemented + recommendations.p2.implemented,
    codeQualityScore,
    performanceScore,
    timeSaved,
    efficiencyScore: Math.round(efficiencyScore * 100) / 100,
  };
}

/**
 * Example usage
 */
export function getCurrentMetrics(): MCPEfficiencyMetrics {
  return calculateMCPEfficiency(
    {
      p0: { priority: 'P0', total: 2, implemented: 2, pending: 0 },
      p1: { priority: 'P1', total: 4, implemented: 3.5, pending: 0.5 },
      p2: { priority: 'P2', total: 2, implemented: 0, pending: 2 },
    },
    {
      typescriptErrors: 0,
      linterErrors: 0,
      serverComponentsPercent: 100,
      clientComponentsPercent: 15,
      testCoverage: 0, // Not measured yet
      technicalDebt: 0,
      accessibility: true,
    },
    {
      fcp: null, // Not measured yet
      tti: null, // Not measured yet
      lcp: null, // Not measured yet
      cls: null, // Not measured yet
      fid: null, // Not measured yet
      bundleSize: null, // Not measured yet
      serverComponentsPercent: 100,
      clientComponentsPercent: 15,
    },
    40 // Estimated hours saved
  );
}

// Export for use in scripts
if (require.main === module) {
  const metrics = getCurrentMetrics();
  console.log('MCP Efficiency Metrics:');
  console.log(JSON.stringify(metrics, null, 2));
}

