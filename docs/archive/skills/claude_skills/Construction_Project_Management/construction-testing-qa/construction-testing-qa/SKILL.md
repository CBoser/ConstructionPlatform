---
name: construction-testing-qa
description: Specialized skill for testing and quality assurance of the construction project management platform. Use when writing unit tests, integration tests, E2E tests, performance tests, or security tests for job management, plan specifications (40 plans, 567 options), workflows, APIs, or UI components. Includes test strategies, coverage requirements, test data generation, CI/CD integration, and quality gates specific to construction workflows.
---

# Construction Testing & QA

Comprehensive guide for testing and quality assurance of the construction project management platform.

## Testing Strategy Overview

### Testing Pyramid
```
              /\
             /E2E\           5% - End-to-end critical paths
            /------\
           /Integration\     15% - API & service integration
          /------------\
         /  Unit Tests  \    80% - Component & function tests
        /----------------\
```

### Coverage Requirements
- **Unit Tests**: 80% code coverage minimum
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user journeys
- **Performance Tests**: All major operations < 2s
- **Security Tests**: All authentication/authorization paths

## Technology Stack

### Testing Tools
- **Unit/Integration**: Jest + Supertest
- **E2E**: Cypress
- **Performance**: k6
- **Security**: OWASP ZAP
- **API Testing**: Postman/Newman
- **Load Testing**: Artillery
- **Visual Regression**: Percy
- **Code Coverage**: Istanbul/nyc

## Unit Testing

### 1. Model Testing

```javascript
// tests/unit/models/Job.test.js
const { Job, Plan, Subdivision } = require('../../../src/models');

describe('Job Model', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  describe('Validation', () => {
    it('should require jobNumber', async () => {
      const job = Job.build({ lotNumber: '123' });
      
      await expect(job.validate()).rejects.toThrow(/jobNumber cannot be null/);
    });

    it('should enforce unique jobNumber', async () => {
      await Job.create({
        jobNumber: 'JOB-001',
        lotNumber: '123',
        planId: plan.id,
        subdivisionId: subdivision.id,
      });

      await expect(
        Job.create({
          jobNumber: 'JOB-001',
          lotNumber: '456',
          planId: plan.id,
          subdivisionId: subdivision.id,
        })
      ).rejects.toThrow(/unique constraint/);
    });

    it('should validate status enum', async () => {
      const job = Job.build({
        jobNumber: 'JOB-001',
        status: 'invalid_status',
      });

      await expect(job.validate()).rejects.toThrow(/invalid input value for enum/);
    });
  });

  describe('Associations', () => {
    it('should belong to a Plan', async () => {
      const job = await Job.create({
        jobNumber: 'JOB-001',
        lotNumber: '123',
        planId: plan.id,
        subdivisionId: subdivision.id,
      });

      const jobWithPlan = await Job.findByPk(job.id, {
        include: 'plan',
      });

      expect(jobWithPlan.plan).toBeDefined();
      expect(jobWithPlan.plan.id).toBe(plan.id);
    });

    it('should have many JobOptions', async () => {
      const job = await Job.create({
        jobNumber: 'JOB-001',
        planId: plan.id,
        subdivisionId: subdivision.id,
      });

      await JobOption.bulkCreate([
        { jobId: job.id, optionId: option1.id },
        { jobId: job.id, optionId: option2.id },
      ]);

      const jobWithOptions = await Job.findByPk(job.id, {
        include: 'selectedOptions',
      });

      expect(jobWithOptions.selectedOptions).toHaveLength(2);
    });
  });

  describe('Methods', () => {
    it('should calculate completion percentage', async () => {
      const job = await Job.create({
        jobNumber: 'JOB-001',
        status: 'in_production',
        estimatedStartDate: new Date('2024-01-01'),
        estimatedCompletionDate: new Date('2024-03-01'),
      });

      const percentage = await job.getCompletionPercentage();
      expect(percentage).toBeGreaterThanOrEqual(0);
      expect(percentage).toBeLessThanOrEqual(100);
    });
  });
});
```

### 2. Service Testing

```javascript
// tests/unit/services/PlanService.test.js
const PlanService = require('../../../src/services/PlanService');
const { Plan, PlanOption } = require('../../../src/models');

jest.mock('../../../src/models');

describe('PlanService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateOptions', () => {
    it('should return valid for compatible options', async () => {
      const mockPlan = {
        id: '123',
        options: [
          {
            optionCode: 'OPT-001',
            conflictingOptions: [],
            requiredOptions: [],
            availableElevations: ['A', 'B'],
          },
          {
            optionCode: 'OPT-002',
            conflictingOptions: [],
            requiredOptions: [],
            availableElevations: ['A', 'B'],
          },
        ],
      };

      Plan.findByPk.mockResolvedValue(mockPlan);

      const result = await PlanService.validateOptions(
        '123',
        ['OPT-001', 'OPT-002'],
        'A'
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect conflicting options', async () => {
      const mockPlan = {
        id: '123',
        options: [
          {
            optionCode: 'OPT-001',
            optionName: 'Hardwood Floors',
            conflictingOptions: ['OPT-002'],
            requiredOptions: [],
          },
          {
            optionCode: 'OPT-002',
            optionName: 'Carpet',
            conflictingOptions: ['OPT-001'],
            requiredOptions: [],
          },
        ],
      };

      Plan.findByPk.mockResolvedValue(mockPlan);

      const result = await PlanService.validateOptions(
        '123',
        ['OPT-001', 'OPT-002'],
        'A'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].type).toBe('OPTION_CONFLICT');
    });

    it('should detect missing requirements', async () => {
      const mockPlan = {
        id: '123',
        options: [
          {
            optionCode: 'OPT-003',
            optionName: 'Upgraded Electrical',
            conflictingOptions: [],
            requiredOptions: ['OPT-004'],
          },
        ],
      };

      Plan.findByPk.mockResolvedValue(mockPlan);

      const result = await PlanService.validateOptions(
        '123',
        ['OPT-003'],
        'A'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe('MISSING_REQUIREMENT');
    });

    it('should calculate schedule impact', async () => {
      const mockPlan = {
        id: '123',
        options: [
          {
            optionCode: 'OPT-005',
            leadTimeDays: 10,
            impactsSchedule: true,
            conflictingOptions: [],
            requiredOptions: [],
          },
          {
            optionCode: 'OPT-006',
            leadTimeDays: 5,
            impactsSchedule: true,
            conflictingOptions: [],
            requiredOptions: [],
          },
        ],
      };

      Plan.findByPk.mockResolvedValue(mockPlan);

      const result = await PlanService.validateOptions(
        '123',
        ['OPT-005', 'OPT-006'],
        'A'
      );

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'SCHEDULE_IMPACT',
        })
      );
    });
  });

  describe('getPlans', () => {
    it('should return paginated plans', async () => {
      const mockPlans = [
        { id: '1', planCode: 'PL-001' },
        { id: '2', planCode: 'PL-002' },
      ];

      Plan.findAndCountAll.mockResolvedValue({
        rows: mockPlans,
        count: 40,
      });

      const result = await PlanService.getPlans(
        { status: 'active' },
        { page: 1, limit: 20 }
      );

      expect(result.plans).toHaveLength(2);
      expect(result.totalPages).toBe(2);
      expect(result.currentPage).toBe(1);
    });

    it('should filter by bedrooms', async () => {
      await PlanService.getPlans(
        { bedrooms: 4 },
        { page: 1, limit: 20 }
      );

      expect(Plan.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            bedrooms: 4,
          }),
        })
      );
    });
  });
});
```

### 3. Workflow Testing

```javascript
// tests/unit/workflows/JobLifecycleWorkflow.test.js
const JobLifecycleWorkflow = require('../../../src/workflows/JobLifecycleWorkflow');
const { Job } = require('../../../src/models');

describe('JobLifecycleWorkflow', () => {
  let mockJob;

  beforeEach(() => {
    mockJob = {
      id: '123',
      jobNumber: 'JOB-001',
      status: 'plan_start',
      save: jest.fn().mockResolvedValue(true),
    };
  });

  describe('transitionTo', () => {
    it('should allow valid state transitions', async () => {
      const result = await JobLifecycleWorkflow.transitionTo(
        mockJob,
        'pdss_initiated',
        { userId: 'user123' }
      );

      expect(result.status).toBe('pdss_initiated');
      expect(mockJob.save).toHaveBeenCalled();
    });

    it('should reject invalid state transitions', async () => {
      await expect(
        JobLifecycleWorkflow.transitionTo(mockJob, 'completed')
      ).rejects.toThrow(/Cannot transition from plan_start to completed/);
    });

    it('should validate required data before transition', async () => {
      const jobWithoutPlan = {
        ...mockJob,
        planId: null,
      };

      await expect(
        JobLifecycleWorkflow.transitionTo(jobWithoutPlan, 'pdss_initiated')
      ).rejects.toThrow(/Missing required data: planId/);
    });

    it('should execute onEnter handlers', async () => {
      const spy = jest.spyOn(JobLifecycleWorkflow, 'handlePDSSInitiated');
      spy.mockResolvedValue();

      await JobLifecycleWorkflow.transitionTo(mockJob, 'pdss_initiated');

      expect(spy).toHaveBeenCalledWith(mockJob, expect.any(Object));
    });

    it('should emit stateChanged event', async () => {
      const eventSpy = jest.fn();
      JobLifecycleWorkflow.on('stateChanged', eventSpy);

      await JobLifecycleWorkflow.transitionTo(mockJob, 'pdss_initiated');

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          jobId: '123',
          oldState: 'plan_start',
          newState: 'pdss_initiated',
        })
      );
    });
  });
});
```

## Integration Testing

### API Integration Tests

```javascript
// tests/integration/api/jobs.test.js
const request = require('supertest');
const app = require('../../../src/app');
const { sequelize, Job, Plan, Subdivision } = require('../../../src/models');

describe('Jobs API', () => {
  let authToken;
  let testPlan;
  let testSubdivision;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Create test data
    testPlan = await Plan.create({
      planCode: 'PL-TEST',
      planName: 'Test Plan',
      bedrooms: 4,
      bathrooms: 2.5,
    });

    testSubdivision = await Subdivision.create({
      subdivisionCode: 'SUB-TEST',
      subdivisionName: 'Test Subdivision',
      builderName: 'Test Builder',
    });

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/v1/jobs', () => {
    it('should create a new job', async () => {
      const response = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobNumber: 'JOB-TEST-001',
          lotNumber: '123',
          planId: testPlan.id,
          subdivisionId: testSubdivision.id,
          elevation: 'A',
          clientName: 'Test Client',
          clientEmail: 'client@example.com',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.jobNumber).toBe('JOB-TEST-001');
      expect(response.body.data.status).toBe('plan_start');
    });

    it('should reject duplicate job number', async () => {
      // Create first job
      await Job.create({
        jobNumber: 'JOB-DUP',
        lotNumber: '123',
        planId: testPlan.id,
        subdivisionId: testSubdivision.id,
      });

      // Try to create duplicate
      await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobNumber: 'JOB-DUP',
          lotNumber: '456',
          planId: testPlan.id,
          subdivisionId: testSubdivision.id,
        })
        .expect(400);
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/v1/jobs')
        .send({
          jobNumber: 'JOB-TEST-002',
          lotNumber: '123',
        })
        .expect(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lotNumber: '123',
          // Missing jobNumber
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('jobNumber');
    });
  });

  describe('GET /api/v1/jobs', () => {
    beforeEach(async () => {
      await Job.bulkCreate([
        {
          jobNumber: 'JOB-001',
          lotNumber: '1',
          status: 'plan_start',
          planId: testPlan.id,
          subdivisionId: testSubdivision.id,
        },
        {
          jobNumber: 'JOB-002',
          lotNumber: '2',
          status: 'approved',
          planId: testPlan.id,
          subdivisionId: testSubdivision.id,
        },
      ]);
    });

    it('should return all jobs', async () => {
      const response = await request(app)
        .get('/api/v1/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/v1/jobs?status=approved')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.every(job => job.status === 'approved')).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/jobs?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.currentPage).toBe(1);
    });
  });

  describe('PUT /api/v1/jobs/:id', () => {
    it('should update job status', async () => {
      const job = await Job.create({
        jobNumber: 'JOB-UPDATE',
        status: 'plan_start',
        planId: testPlan.id,
        subdivisionId: testSubdivision.id,
      });

      const response = await request(app)
        .put(`/api/v1/jobs/${job.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'pdss_initiated' })
        .expect(200);

      expect(response.body.data.status).toBe('pdss_initiated');
    });

    it('should validate state transitions', async () => {
      const job = await Job.create({
        jobNumber: 'JOB-INVALID',
        status: 'plan_start',
        planId: testPlan.id,
        subdivisionId: testSubdivision.id,
      });

      await request(app)
        .put(`/api/v1/jobs/${job.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed' })  // Invalid transition
        .expect(400);
    });
  });
});
```

### Database Integration Tests

```javascript
// tests/integration/database/migrations.test.js
describe('Database Migrations', () => {
  it('should run all migrations successfully', async () => {
    const umzug = require('../../../src/database/umzug');
    await expect(umzug.up()).resolves.not.toThrow();
  });

  it('should rollback migrations', async () => {
    const umzug = require('../../../src/database/umzug');
    await umzug.up();
    await expect(umzug.down()).resolves.not.toThrow();
  });

  it('should create all required tables', async () => {
    const tables = await sequelize.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
    );

    const tableNames = tables[0].map(t => t.tablename);
    
    expect(tableNames).toContain('jobs');
    expect(tableNames).toContain('plans');
    expect(tableNames).toContain('plan_options');
    expect(tableNames).toContain('subdivisions');
  });
});
```

## End-to-End Testing

### Cypress E2E Tests

```javascript
// cypress/e2e/job-creation.cy.js
describe('Job Creation Flow', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password');
  });

  it('should create a new job through the UI', () => {
    // Navigate to job creation
    cy.visit('/jobs/new');

    // Fill out form
    cy.get('[data-testid="job-number"]').type('JOB-E2E-001');
    cy.get('[data-testid="lot-number"]').type('123');
    
    // Select subdivision
    cy.get('[data-testid="subdivision-select"]').click();
    cy.contains('Green Valley Estates').click();

    // Select plan
    cy.get('[data-testid="plan-select"]').click();
    cy.contains('The Madison - 4BR/2.5BA').click();

    // Select elevation
    cy.get('[data-testid="elevation-select"]').click();
    cy.contains('Elevation A').click();

    // Client information
    cy.get('[data-testid="client-name"]').type('John Doe');
    cy.get('[data-testid="client-email"]').type('john@example.com');

    // Submit
    cy.get('[data-testid="submit-button"]').click();

    // Verify success
    cy.contains('Job created successfully').should('be.visible');
    cy.url().should('include', '/jobs/JOB-E2E-001');
  });

  it('should validate required fields', () => {
    cy.visit('/jobs/new');

    // Try to submit without filling fields
    cy.get('[data-testid="submit-button"]').click();

    // Check for error messages
    cy.contains('Job number is required').should('be.visible');
    cy.contains('Lot number is required').should('be.visible');
  });

  it('should prevent duplicate job numbers', () => {
    // Create first job
    cy.createJob('JOB-DUP-001', { lotNumber: '123' });

    // Try to create duplicate
    cy.visit('/jobs/new');
    cy.get('[data-testid="job-number"]').type('JOB-DUP-001');
    cy.get('[data-testid="lot-number"]').type('456');
    cy.get('[data-testid="submit-button"]').click();

    cy.contains('Job number already exists').should('be.visible');
  });
});

describe('Option Selection Flow', () => {
  it('should select compatible options', () => {
    cy.createJob('JOB-OPT-001');
    cy.visit('/jobs/JOB-OPT-001/options');

    // Expand exterior category
    cy.contains('Exterior').click();

    // Select brick option
    cy.get('[data-testid="option-BRICK-01"]').check();
    
    // Select upgraded windows
    cy.get('[data-testid="option-WINDOW-UPG"]').check();

    // Should show no errors
    cy.get('[data-testid="validation-errors"]').should('not.exist');

    // Save selections
    cy.get('[data-testid="save-options"]').click();
    cy.contains('Options saved').should('be.visible');
  });

  it('should detect conflicting options', () => {
    cy.visit('/jobs/JOB-OPT-002/options');

    // Select hardwood floors
    cy.get('[data-testid="option-HARDWOOD"]').check();

    // Try to select carpet (conflicting)
    cy.get('[data-testid="option-CARPET"]').check();

    // Should show error
    cy.contains('conflicts with').should('be.visible');

    // Carpet should be disabled or unchecked
    cy.get('[data-testid="option-CARPET"]').should('be.disabled');
  });

  it('should show recommendations', () => {
    cy.visit('/jobs/JOB-OPT-003/options');

    // Select a few options
    cy.get('[data-testid="option-GRANITE"]').check();
    cy.get('[data-testid="option-TILE-UPG"]').check();

    // Recommendations should appear
    cy.get('[data-testid="recommendations"]').should('be.visible');
    cy.get('[data-testid="recommendations"]')
      .should('contain', 'Frequently selected');
  });
});

describe('Schedule Board', () => {
  it('should drag and drop jobs between columns', () => {
    cy.visit('/schedule');

    // Drag job from 'Plan Review' to 'Approved'
    cy.get('[data-testid="job-JOB-001"]')
      .drag('[data-testid="column-approved"]');

    // Verify status updated
    cy.get('[data-testid="column-approved"]')
      .should('contain', 'JOB-001');

    // Verify real-time update
    cy.wait(1000);
    cy.reload();
    cy.get('[data-testid="column-approved"]')
      .should('contain', 'JOB-001');
  });
});
```

## Performance Testing

### k6 Load Test

```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% of requests under 2s
    http_req_failed: ['rate<0.01'],      // Less than 1% errors
  },
};

const BASE_URL = 'http://localhost:3000/api/v1';
let authToken;

export function setup() {
  const loginRes = http.post(`${BASE_URL}/auth/login`, {
    email: 'test@example.com',
    password: 'password',
  });
  
  return { token: loginRes.json('token') };
}

export default function (data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // Test dashboard load
  let res = http.get(`${BASE_URL}/dashboard`, { headers });
  check(res, {
    'dashboard loads': (r) => r.status === 200,
    'dashboard fast': (r) => r.timings.duration < 2000,
  });

  sleep(1);

  // Test job list
  res = http.get(`${BASE_URL}/jobs`, { headers });
  check(res, {
    'jobs list loads': (r) => r.status === 200,
    'jobs list fast': (r) => r.timings.duration < 2000,
  });

  sleep(1);

  // Test option validation
  res = http.post(
    `${BASE_URL}/plans/123/validate-options`,
    JSON.stringify({
      selectedOptions: ['OPT-001', 'OPT-002'],
      elevation: 'A',
    }),
    { headers }
  );
  
  check(res, {
    'validation works': (r) => r.status === 200,
    'validation fast': (r) => r.timings.duration < 500,
  });

  sleep(2);
}
```

## Security Testing

### OWASP ZAP Integration

```javascript
// tests/security/zap-scan.js
const ZapClient = require('zaproxy');

const runSecurityScan = async () => {
  const zapOptions = {
    apiKey: process.env.ZAP_API_KEY,
    proxy: 'http://localhost:8080',
  };

  const zap = new ZapClient(zapOptions);

  // Spider the application
  console.log('Starting spider...');
  await zap.spider.scan('http://localhost:3000');

  // Wait for spider to complete
  await new Promise(resolve => setTimeout(resolve, 60000));

  // Run active scan
  console.log('Starting active scan...');
  await zap.ascan.scan('http://localhost:3000');

  // Wait for scan to complete
  await new Promise(resolve => setTimeout(resolve, 300000));

  // Get alerts
  const alerts = await zap.core.alerts();
  
  console.log(`Found ${alerts.length} security issues`);
  
  // Fail if high-risk issues found
  const highRisk = alerts.filter(a => a.risk === 'High');
  if (highRisk.length > 0) {
    console.error('High-risk security issues found:', highRisk);
    process.exit(1);
  }
};
```

## Test Data Generation

```javascript
// tests/helpers/testDataGenerator.js
const { faker } = require('@faker-js/faker');

class TestDataGenerator {
  static generateJob(overrides = {}) {
    return {
      jobNumber: faker.string.alphanumeric(10).toUpperCase(),
      lotNumber: faker.number.int({ min: 1, max: 999 }).toString(),
      streetAddress: faker.location.streetAddress(),
      clientName: faker.person.fullName(),
      clientEmail: faker.internet.email(),
      clientPhone: faker.phone.number(),
      elevation: faker.helpers.arrayElement(['A', 'B', 'C', 'D']),
      status: 'plan_start',
      priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
      ...overrides,
    };
  }

  static generatePlan(overrides = {}) {
    return {
      planCode: `PL-${faker.number.int({ min: 1000, max: 9999 })}`,
      planName: `The ${faker.location.city()}`,
      baseSquareFootage: faker.number.int({ min: 1500, max: 4000 }),
      bedrooms: faker.number.int({ min: 2, max: 5 }),
      bathrooms: faker.number.float({ min: 1.5, max: 4.5, precision: 0.5 }),
      stories: faker.number.int({ min: 1, max: 3 }),
      status: 'active',
      ...overrides,
    };
  }

  static async seedTestData(count = 100) {
    const plans = Array(40).fill(null).map(() => this.generatePlan());
    await Plan.bulkCreate(plans);

    const jobs = Array(count).fill(null).map(() => 
      this.generateJob({ planId: faker.helpers.arrayElement(plans).id })
    );
    await Job.bulkCreate(jobs);

    return { plans, jobs };
  }
}

module.exports = TestDataGenerator;
```

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379
      
      - name: Generate coverage report
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Run security scan
        run: npm run test:security
```

## Quality Gates

### Pre-commit Checks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test:unit"
    }
  },
  "lint-staged": {
    "*.js": ["eslint --fix", "jest --bail --findRelatedTests"]
  }
}
```

### Coverage Requirements
```javascript
// jest.config.js
module.exports = {
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

## Testing Checklist

### Before Release
- [ ] All unit tests pass (80%+ coverage)
- [ ] All integration tests pass
- [ ] Critical E2E paths tested
- [ ] Performance tests meet SLA (<2s response)
- [ ] Security scan shows no high-risk issues
- [ ] Load test handles 200 concurrent users
- [ ] Database migrations tested
- [ ] Rollback procedures tested
- [ ] Documentation updated
- [ ] Changelog updated
