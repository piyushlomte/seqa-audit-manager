import { ITEM_SEVERITIES, QA_CATEGORIES } from '../data/initialData';

/**
 * Calculates weighted score percentage and determines milestone verdict.
 * Formula:
 * Score = (Sum of (Item Status Multiplier * Item Severity Weight) / Sum of (Applicable Item Severity Weights)) * 100
 * Multipliers: PASS = 1.0, MITIGATION = 0.5, FAIL = 0.0, NA = Excluded
 *
 * Verdict Rules:
 * APPROVED: Score >= 85% AND 0 Critical Fails.
 * CONDITIONAL APPROVAL: Score 70-84% AND 0 Critical Fails (or needs mitigation).
 * REJECTED: Score < 70% OR 1+ Critical Fails.
 */
export function calculateAuditScore(items, itemResults = {}) {
  if (!items || items.length === 0) {
    return {
      score: 0,
      verdict: 'REJECTED',
      verdictLabel: 'Rejected',
      verdictColor: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800',
      passedCount: 0,
      failedCount: 0,
      mitigationCount: 0,
      naCount: 0,
      criticalFailsCount: 0,
      totalApplicable: 0,
      categoryScores: {}
    };
  }

  let totalWeightedScore = 0;
  let totalApplicableWeight = 0;

  let passedCount = 0;
  let failedCount = 0;
  let mitigationCount = 0;
  let naCount = 0;
  let criticalFailsCount = 0;

  const categoryStats = {};
  QA_CATEGORIES.forEach(cat => {
    categoryStats[cat.id] = {
      weightedEarned: 0,
      weightedPossible: 0,
      passed: 0,
      failed: 0,
      mitigation: 0,
      na: 0,
      total: 0
    };
  });

  items.forEach(item => {
    const result = itemResults[item.id] || { status: 'UNREVIEWED' };
    const status = result.status || 'UNREVIEWED';
    const severityConfig = ITEM_SEVERITIES[item.severity] || ITEM_SEVERITIES.MEDIUM;
    const weight = severityConfig.weight;

    const catId = item.categoryId;
    if (categoryStats[catId]) {
      categoryStats[catId].total++;
    }

    if (status === 'NA') {
      naCount++;
      if (categoryStats[catId]) categoryStats[catId].na++;
      return; // Exclude from calculations
    }

    let statusMultiplier = 0;
    if (status === 'PASS') {
      statusMultiplier = 1.0;
      passedCount++;
      if (categoryStats[catId]) categoryStats[catId].passed++;
    } else if (status === 'MITIGATION') {
      statusMultiplier = 0.5;
      mitigationCount++;
      if (categoryStats[catId]) categoryStats[catId].mitigation++;
    } else if (status === 'FAIL') {
      statusMultiplier = 0.0;
      failedCount++;
      if (categoryStats[catId]) categoryStats[catId].failed++;
      if (item.severity === 'CRITICAL') {
        criticalFailsCount++;
      }
    }

    const earned = weight * statusMultiplier;
    totalWeightedScore += earned;
    totalApplicableWeight += weight;

    if (categoryStats[catId]) {
      categoryStats[catId].weightedEarned += earned;
      categoryStats[catId].weightedPossible += weight;
    }
  });

  const finalScore = totalApplicableWeight > 0 
    ? Math.round((totalWeightedScore / totalApplicableWeight) * 1000) / 10 
    : 0;

  // Determine Verdict
  let verdict = 'REJECTED';
  let verdictLabel = 'Rejected';
  let verdictColor = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800';

  if (criticalFailsCount > 0) {
    verdict = 'REJECTED';
    verdictLabel = 'Rejected (Critical Failures)';
    verdictColor = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800';
  } else if (finalScore >= 85) {
    verdict = 'APPROVED';
    verdictLabel = 'Approved';
    verdictColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800';
  } else if (finalScore >= 70) {
    verdict = 'CONDITIONAL_APPROVAL';
    verdictLabel = 'Conditional Approval';
    verdictColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800';
  } else {
    verdict = 'REJECTED';
    verdictLabel = 'Rejected (Score < 70%)';
    verdictColor = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800';
  }

  // Calculate category score percentages
  const categoryScores = {};
  Object.keys(categoryStats).forEach(catId => {
    const stat = categoryStats[catId];
    categoryScores[catId] = {
      ...stat,
      score: stat.weightedPossible > 0 ? Math.round((stat.weightedEarned / stat.weightedPossible) * 100) : 100
    };
  });

  return {
    score: finalScore,
    verdict,
    verdictLabel,
    verdictColor,
    passedCount,
    failedCount,
    mitigationCount,
    naCount,
    criticalFailsCount,
    totalApplicable: items.length - naCount,
    totalItems: items.length,
    categoryScores
  };
}

export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}
