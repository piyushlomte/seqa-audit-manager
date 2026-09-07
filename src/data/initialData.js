export const QA_CATEGORIES = [
  {
    id: 'code-quality',
    name: 'Code Quality & Architecture',
    shortName: 'Code Quality',
    icon: 'Code2',
    color: '#3b82f6',
    bgLight: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    description: 'Static analysis, linter enforcement, test coverage, and modular design.'
  },
  {
    id: 'testing-automation',
    name: 'Testing & Automation',
    shortName: 'Testing',
    icon: 'TestTube2',
    color: '#10b981',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    description: 'Unit test execution, API integration testing, and E2E regression suites.'
  },
  {
    id: 'security-compliance',
    name: 'Security & Compliance',
    shortName: 'Security',
    icon: 'ShieldCheck',
    color: '#ef4444',
    bgLight: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    description: 'Vulnerability scans, credential exposure checks, and access control.'
  },
  {
    id: 'documentation',
    name: 'Documentation & Specs',
    shortName: 'Documentation',
    icon: 'FileText',
    color: '#8b5cf6',
    bgLight: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    description: 'API specifications, release notes, and operational documentation.'
  },
  {
    id: 'performance-scalability',
    name: 'Performance & Scalability',
    shortName: 'Performance',
    icon: 'Gauge',
    color: '#f59e0b',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    description: 'Latency benchmarks, database query optimization, and resource utilization.'
  },
  {
    id: 'deployment-ops',
    name: 'Deployment & Operations',
    shortName: 'Deployment',
    icon: 'Server',
    color: '#06b6d4',
    bgLight: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    description: 'CI/CD pipeline verification, rollback procedures, and health monitoring.'
  }
];

export const ITEM_SEVERITIES = {
  CRITICAL: { label: 'Critical', weight: 3, color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800' },
  HIGH: { label: 'High', weight: 2, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800' },
  MEDIUM: { label: 'Medium', weight: 1.5, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800' },
  LOW: { label: 'Low', weight: 1, color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-800' }
};

export const INITIAL_TEMPLATES = [
  {
    id: 'tmpl-standard-qa',
    name: 'Standard Quality Assurance Checklist',
    description: 'Comprehensive baseline evaluation checklist for auditing project deliverables prior to milestone approval.',
    isDefault: true,
    categoryIds: ['code-quality', 'testing-automation', 'security-compliance', 'documentation', 'performance-scalability', 'deployment-ops'],
    items: [
      {
        id: 'item-cq-1',
        categoryId: 'code-quality',
        title: 'Static Analysis & Linter Verification',
        description: 'Ensure static analysis scanners report zero blocking errors or critical code smells.',
        severity: 'CRITICAL',
        guidelines: 'Verify scanner output logs in the CI pipeline.'
      },
      {
        id: 'item-cq-2',
        categoryId: 'code-quality',
        title: 'Unit Test Statement Coverage (≥ 85%)',
        description: 'Verify codebase unit test statement coverage meets the required 85% baseline threshold.',
        severity: 'HIGH',
        guidelines: 'Inspect test coverage report artifacts.'
      },
      {
        id: 'item-cq-3',
        categoryId: 'code-quality',
        title: 'Git Workflow & Code Review Approvals',
        description: 'Confirm pull request has required peer approvals and clean commit history.',
        severity: 'MEDIUM',
        guidelines: 'Ensure PR sign-off requirement is met before merging.'
      },
      {
        id: 'item-cq-4',
        categoryId: 'code-quality',
        title: 'Modular Architecture & Clean Imports',
        description: 'Verify component boundaries and ensure no circular dependencies exist.',
        severity: 'MEDIUM',
        guidelines: 'Run dependency graph analyzer.'
      },
      {
        id: 'item-ta-1',
        categoryId: 'testing-automation',
        title: 'Automated Regression Suite Execution',
        description: 'All automated regression test suites pass without intermittent failures.',
        severity: 'CRITICAL',
        guidelines: 'Review CI test runner summary.'
      },
      {
        id: 'item-ta-2',
        categoryId: 'testing-automation',
        title: 'API Integration Test Coverage',
        description: 'New and modified endpoints include automated integration tests for valid and error conditions.',
        severity: 'HIGH',
        guidelines: 'Inspect API test execution results.'
      },
      {
        id: 'item-ta-3',
        categoryId: 'testing-automation',
        title: 'End-to-End Critical Workflow Playbooks',
        description: 'Automated E2E tests pass key user journeys including authentication and core data workflows.',
        severity: 'HIGH',
        guidelines: 'Verify E2E execution report.'
      },
      {
        id: 'item-sc-1',
        categoryId: 'security-compliance',
        title: 'Third-Party Dependency Vulnerability Audit',
        description: 'Verify zero High or Critical vulnerabilities exist in project dependencies.',
        severity: 'CRITICAL',
        guidelines: 'Inspect dependency vulnerability audit reports.'
      },
      {
        id: 'item-sc-2',
        categoryId: 'security-compliance',
        title: 'Secrets & Credential Exposure Check',
        description: 'Ensure no plain-text credentials, API keys, or certificates are present in source repository.',
        severity: 'CRITICAL',
        guidelines: 'Verify secret scanner execution logs.'
      },
      {
        id: 'item-sc-3',
        categoryId: 'security-compliance',
        title: 'Role-Based Authorization Enforcement',
        description: 'Confirm authorization checks are enforced across protected routes and API endpoints.',
        severity: 'HIGH',
        guidelines: 'Verify token access controls.'
      },
      {
        id: 'item-dc-1',
        categoryId: 'documentation',
        title: 'OpenAPI Specification Alignment',
        description: 'Ensure API documentation accurately reflects current endpoint schemas and status codes.',
        severity: 'HIGH',
        guidelines: 'Compare OpenAPI spec against controller endpoints.'
      },
      {
        id: 'item-dc-2',
        categoryId: 'documentation',
        title: 'Release Notes & Feature Changelog',
        description: 'Verify release notes document key additions, bug fixes, and configuration requirements.',
        severity: 'MEDIUM',
        guidelines: 'Review updated changelog documentation.'
      },
      {
        id: 'item-ps-1',
        categoryId: 'performance-scalability',
        title: 'API Latency SLA Benchmark (P95 < 200ms)',
        description: '95th percentile API response time is within the 200ms performance threshold under standard load.',
        severity: 'HIGH',
        guidelines: 'Review performance load test summary.'
      },
      {
        id: 'item-ps-2',
        categoryId: 'performance-scalability',
        title: 'Database Query & Index Optimization',
        description: 'Verify database query execution plans and ensure required indices exist.',
        severity: 'HIGH',
        guidelines: 'Inspect database query performance reports.'
      },
      {
        id: 'item-do-1',
        categoryId: 'deployment-ops',
        title: 'CI/CD Pipeline & Build Status',
        description: 'Automated deployment pipeline builds, tests, and deploys without errors.',
        severity: 'CRITICAL',
        guidelines: 'Verify pipeline execution status.'
      },
      {
        id: 'item-do-2',
        categoryId: 'deployment-ops',
        title: 'Rollback & Recovery Procedure Verification',
        description: 'Confirm automated rollback scripts and database migration rollbacks are validated.',
        severity: 'HIGH',
        guidelines: 'Review rollback procedure checklist.'
      }
    ]
  }
];

// Clean Production Initial State (No dummy projects, audits, or CAP tickets)
export const INITIAL_PROJECTS = [];
export const INITIAL_AUDITS = [];
export const INITIAL_CAP_TICKETS = [];
