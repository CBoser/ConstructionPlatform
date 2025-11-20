---
name: construction-api-developer
description: Specialized skill for developing RESTful APIs for the construction project management platform. Use when building backend services for job management, plan specifications (40 plans, 567 options), PDSS integration, schedule coordination, contract/PO tracking, or subdivision management (31 subdivisions). Includes API design patterns, data models, business logic, validation rules, and integration endpoints specific to construction workflows.
---

# Construction API Developer

Comprehensive guide for building the backend API services for the integrated construction project management platform.

## API Architecture Overview

### Technology Stack
- **Runtime**: Node.js 18+ with Express.js
- **Database**: PostgreSQL 14+ with Sequelize ORM
- **Cache**: Redis for session and query caching
- **Authentication**: JWT with role-based access control (RBAC)
- **Real-time**: Socket.io for live updates
- **Documentation**: OpenAPI 3.0 / Swagger
- **Testing**: Jest + Supertest

### Project Structure
```
/api
├── /src
│   ├── /controllers     # Request handlers
│   ├── /models          # Database models
│   ├── /services        # Business logic
│   ├── /middleware      # Auth, validation, logging
│   ├── /routes          # API route definitions
│   ├── /validators      # Request validation schemas
│   ├── /utils           # Helper functions
│   └── /config          # Configuration files
├── /tests
│   ├── /unit
│   ├── /integration
│   └── /fixtures
└── server.js
```

## Core Data Models

### 1. Plan Model
```javascript
// models/Plan.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Plan = sequelize.define('Plan', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    planCode: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
      validate: {
        is: /^PL-\d{4}$/  // Format: PL-1234
      }
    },
    planName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    baseSquareFootage: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bathrooms: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: false
    },
    stories: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    garageType: {
      type: DataTypes.ENUM('attached', 'detached', 'none'),
      defaultValue: 'attached'
    },
    availableElevations: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    basePriceTier: {
      type: DataTypes.STRING(20)
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'archived'),
      defaultValue: 'active'
    },
    thumbnailUrl: {
      type: DataTypes.STRING(500)
    },
    floorPlanUrl: {
      type: DataTypes.STRING(500)
    },
    marketingDescription: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['planCode'] },
      { fields: ['status'] },
      { fields: ['bedrooms', 'bathrooms'] }
    ]
  });

  Plan.associate = (models) => {
    Plan.hasMany(models.PlanOption, { foreignKey: 'planId', as: 'options' });
    Plan.hasMany(models.Job, { foreignKey: 'planId', as: 'jobs' });
  };

  return Plan;
};
```

### 2. PlanOption Model
```javascript
// models/PlanOption.js
module.exports = (sequelize) => {
  const PlanOption = sequelize.define('PlanOption', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    optionCode: {
      type: DataTypes.STRING(30),
      unique: true,
      allowNull: false
    },
    optionName: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM(
        'exterior',
        'interior',
        'structural',
        'mechanical',
        'electrical',
        'plumbing',
        'hvac',
        'flooring',
        'cabinets',
        'countertops',
        'fixtures',
        'other'
      ),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    priceTier: {
      type: DataTypes.STRING(20)
    },
    availableElevations: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    compatibleOptions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Array of optionCode values this option works with'
    },
    conflictingOptions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Array of optionCode values this option conflicts with'
    },
    requiredOptions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Array of optionCode values required before selecting this'
    },
    leadTimeDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Additional lead time this option adds'
    },
    impactsSchedule: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    requiresEngineering: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('available', 'discontinued', 'seasonal'),
      defaultValue: 'available'
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['optionCode'] },
      { fields: ['category'] },
      { fields: ['status'] }
    ]
  });

  PlanOption.associate = (models) => {
    PlanOption.belongsTo(models.Plan, { foreignKey: 'planId', as: 'plan' });
    PlanOption.hasMany(models.JobOption, { foreignKey: 'optionId', as: 'jobSelections' });
  };

  return PlanOption;
};
```

### 3. Job Model
```javascript
// models/Job.js
module.exports = (sequelize) => {
  const Job = sequelize.define('Job', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    jobNumber: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    lotNumber: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    streetAddress: {
      type: DataTypes.STRING(200)
    },
    clientName: {
      type: DataTypes.STRING(150)
    },
    clientEmail: {
      type: DataTypes.STRING(150)
    },
    clientPhone: {
      type: DataTypes.STRING(20)
    },
    elevation: {
      type: DataTypes.STRING(50)
    },
    status: {
      type: DataTypes.ENUM(
        'plan_start',
        'pdss_initiated',
        'plan_review',
        'approved',
        'in_production',
        'quality_check',
        'completed',
        'on_hold',
        'cancelled'
      ),
      defaultValue: 'plan_start'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    estimatedStartDate: {
      type: DataTypes.DATE
    },
    actualStartDate: {
      type: DataTypes.DATE
    },
    estimatedCompletionDate: {
      type: DataTypes.DATE
    },
    actualCompletionDate: {
      type: DataTypes.DATE
    },
    notes: {
      type: DataTypes.TEXT
    },
    flags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Issue flags like "missing_docs", "engineering_review", etc.'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Flexible field for additional data'
    }
  }, {
    timestamps: true,
    paranoid: true,  // Soft delete support
    indexes: [
      { fields: ['jobNumber'] },
      { fields: ['status'] },
      { fields: ['subdivisionId'] },
      { fields: ['planId'] },
      { fields: ['estimatedStartDate'] }
    ]
  });

  Job.associate = (models) => {
    Job.belongsTo(models.Plan, { foreignKey: 'planId', as: 'plan' });
    Job.belongsTo(models.Subdivision, { foreignKey: 'subdivisionId', as: 'subdivision' });
    Job.hasMany(models.JobOption, { foreignKey: 'jobId', as: 'selectedOptions' });
    Job.hasMany(models.TimeEntry, { foreignKey: 'jobId', as: 'timeEntries' });
    Job.hasOne(models.Contract, { foreignKey: 'jobId', as: 'contract' });
    Job.hasMany(models.PDSSDocument, { foreignKey: 'jobId', as: 'pdssDocuments' });
  };

  return Job;
};
```

### 4. Subdivision Model
```javascript
// models/Subdivision.js
module.exports = (sequelize) => {
  const Subdivision = sequelize.define('Subdivision', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    subdivisionCode: {
      type: DataTypes.STRING(30),
      unique: true,
      allowNull: false
    },
    subdivisionName: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    builderName: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(100)
    },
    state: {
      type: DataTypes.STRING(2)
    },
    zipCode: {
      type: DataTypes.STRING(10)
    },
    totalLots: {
      type: DataTypes.INTEGER
    },
    availablePlans: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Array of planCode values available in this subdivision'
    },
    specialRequirements: {
      type: DataTypes.TEXT
    },
    hoa: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('active', 'sold_out', 'inactive'),
      defaultValue: 'active'
    },
    contactName: {
      type: DataTypes.STRING(150)
    },
    contactEmail: {
      type: DataTypes.STRING(150)
    },
    contactPhone: {
      type: DataTypes.STRING(20)
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['subdivisionCode'] },
      { fields: ['status'] },
      { fields: ['builderName'] }
    ]
  });

  Subdivision.associate = (models) => {
    Subdivision.hasMany(models.Job, { foreignKey: 'subdivisionId', as: 'jobs' });
  };

  return Subdivision;
};
```

## API Endpoints Structure

### Plan Management API

```javascript
// routes/plans.js
const express = require('express');
const router = express.Router();
const PlanController = require('../controllers/PlanController');
const { authenticate, authorize } = require('../middleware/auth');
const { validatePlan } = require('../validators/planValidator');

/**
 * @route   GET /api/v1/plans
 * @desc    Get all plans with filtering and pagination
 * @access  Public
 */
router.get('/', PlanController.getPlans);

/**
 * @route   GET /api/v1/plans/:id
 * @desc    Get plan by ID with all options
 * @access  Public
 */
router.get('/:id', PlanController.getPlanById);

/**
 * @route   GET /api/v1/plans/:id/options
 * @desc    Get all options for a specific plan
 * @access  Public
 */
router.get('/:id/options', PlanController.getPlanOptions);

/**
 * @route   POST /api/v1/plans
 * @desc    Create new plan
 * @access  Private (Admin only)
 */
router.post('/', 
  authenticate, 
  authorize(['admin']), 
  validatePlan, 
  PlanController.createPlan
);

/**
 * @route   PUT /api/v1/plans/:id
 * @desc    Update plan
 * @access  Private (Admin only)
 */
router.put('/:id', 
  authenticate, 
  authorize(['admin']), 
  validatePlan, 
  PlanController.updatePlan
);

/**
 * @route   DELETE /api/v1/plans/:id
 * @desc    Archive plan (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:id', 
  authenticate, 
  authorize(['admin']), 
  PlanController.archivePlan
);

/**
 * @route   POST /api/v1/plans/:id/validate-options
 * @desc    Validate option selection for compatibility
 * @access  Public
 */
router.post('/:id/validate-options', PlanController.validateOptionSelection);

module.exports = router;
```

### Plan Controller Implementation

```javascript
// controllers/PlanController.js
const PlanService = require('../services/PlanService');
const { validationResult } = require('express-validator');

class PlanController {
  /**
   * Get all plans with filtering and pagination
   */
  static async getPlans(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status = 'active',
        bedrooms,
        bathrooms,
        stories,
        search
      } = req.query;

      const filters = {
        status,
        ...(bedrooms && { bedrooms: parseInt(bedrooms) }),
        ...(bathrooms && { bathrooms: parseFloat(bathrooms) }),
        ...(stories && { stories: parseInt(stories) }),
        ...(search && { search })
      };

      const result = await PlanService.getPlans(filters, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: result.plans,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalRecords: result.totalRecords,
          limit: result.limit
        }
      });
    } catch (error) {
      console.error('Error in getPlans:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving plans',
        error: error.message
      });
    }
  }

  /**
   * Get plan by ID with options
   */
  static async getPlanById(req, res) {
    try {
      const { id } = req.params;
      const { includeOptions = true } = req.query;

      const plan = await PlanService.getPlanById(id, includeOptions);

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found'
        });
      }

      res.json({
        success: true,
        data: plan
      });
    } catch (error) {
      console.error('Error in getPlanById:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving plan',
        error: error.message
      });
    }
  }

  /**
   * Validate option selection for conflicts and requirements
   */
  static async validateOptionSelection(req, res) {
    try {
      const { id } = req.params;
      const { selectedOptions, elevation } = req.body;

      const validation = await PlanService.validateOptions(
        id,
        selectedOptions,
        elevation
      );

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error('Error in validateOptionSelection:', error);
      res.status(500).json({
        success: false,
        message: 'Error validating options',
        error: error.message
      });
    }
  }
}

module.exports = PlanController;
```

### Business Logic Service

```javascript
// services/PlanService.js
const { Plan, PlanOption } = require('../models');
const { Op } = require('sequelize');

class PlanService {
  /**
   * Validate option selection against business rules
   * - Check for conflicting options
   * - Verify required dependencies
   * - Ensure elevation compatibility
   */
  static async validateOptions(planId, selectedOptionCodes, elevation) {
    const plan = await Plan.findByPk(planId, {
      include: [{ model: PlanOption, as: 'options' }]
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };

    // Get full option objects for selected codes
    const selectedOptions = plan.options.filter(opt => 
      selectedOptionCodes.includes(opt.optionCode)
    );

    // Check elevation compatibility
    if (elevation) {
      const incompatibleOptions = selectedOptions.filter(opt => 
        opt.availableElevations.length > 0 && 
        !opt.availableElevations.includes(elevation)
      );

      if (incompatibleOptions.length > 0) {
        validation.isValid = false;
        validation.errors.push({
          type: 'ELEVATION_INCOMPATIBLE',
          message: `Options not available for elevation ${elevation}`,
          optionCodes: incompatibleOptions.map(opt => opt.optionCode)
        });
      }
    }

    // Check for conflicts
    for (const option of selectedOptions) {
      const conflicts = option.conflictingOptions.filter(code => 
        selectedOptionCodes.includes(code)
      );

      if (conflicts.length > 0) {
        validation.isValid = false;
        validation.errors.push({
          type: 'OPTION_CONFLICT',
          message: `${option.optionName} conflicts with selected options`,
          optionCode: option.optionCode,
          conflictsWith: conflicts
        });
      }
    }

    // Check for missing requirements
    for (const option of selectedOptions) {
      const missingRequirements = option.requiredOptions.filter(code =>
        !selectedOptionCodes.includes(code)
      );

      if (missingRequirements.length > 0) {
        validation.isValid = false;
        validation.errors.push({
          type: 'MISSING_REQUIREMENT',
          message: `${option.optionName} requires additional options`,
          optionCode: option.optionCode,
          requires: missingRequirements
        });
      }
    }

    // Generate recommendations for compatible options
    const allCompatibleCodes = selectedOptions
      .flatMap(opt => opt.compatibleOptions)
      .filter(code => !selectedOptionCodes.includes(code));

    const uniqueCompatible = [...new Set(allCompatibleCodes)];
    
    if (uniqueCompatible.length > 0) {
      const compatibleOptions = await PlanOption.findAll({
        where: { optionCode: uniqueCompatible }
      });

      validation.recommendations = compatibleOptions.map(opt => ({
        optionCode: opt.optionCode,
        optionName: opt.optionName,
        category: opt.category,
        reason: 'Frequently selected with your current choices'
      }));
    }

    // Check for schedule impacts
    const scheduleImpact = selectedOptions
      .filter(opt => opt.impactsSchedule)
      .reduce((sum, opt) => sum + opt.leadTimeDays, 0);

    if (scheduleImpact > 14) {
      validation.warnings.push({
        type: 'SCHEDULE_IMPACT',
        message: `Selected options add ${scheduleImpact} days to schedule`,
        additionalDays: scheduleImpact
      });
    }

    // Check for engineering requirements
    const needsEngineering = selectedOptions.some(opt => opt.requiresEngineering);
    if (needsEngineering) {
      validation.warnings.push({
        type: 'ENGINEERING_REQUIRED',
        message: 'One or more options require engineering review',
        optionCodes: selectedOptions
          .filter(opt => opt.requiresEngineering)
          .map(opt => opt.optionCode)
      });
    }

    return validation;
  }
}

module.exports = PlanService;
```

## Authentication & Authorization

### JWT Middleware
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Authenticate JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.',
      error: error.message
    });
  }
};

/**
 * Authorize based on roles
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Insufficient permissions.'
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
```

## Testing Strategy

### Unit Test Example
```javascript
// tests/unit/services/PlanService.test.js
const PlanService = require('../../../src/services/PlanService');
const { Plan, PlanOption } = require('../../../src/models');

jest.mock('../../../src/models');

describe('PlanService.validateOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
          availableElevations: []
        },
        {
          optionCode: 'OPT-002',
          optionName: 'Carpet',
          conflictingOptions: ['OPT-001'],
          requiredOptions: [],
          availableElevations: []
        }
      ]
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
          requiredOptions: ['OPT-004'],  // Requires breaker panel upgrade
          availableElevations: []
        }
      ]
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
});
```

## Performance Optimization

### Caching Strategy
```javascript
// utils/cache.js
const Redis = require('redis');
const client = Redis.createClient({ url: process.env.REDIS_URL });

client.connect();

/**
 * Cache wrapper for frequently accessed data
 */
const cacheWrapper = (key, ttl = 3600) => {
  return async (fetchFunction) => {
    try {
      // Try to get from cache
      const cached = await client.get(key);
      if (cached) {
        return JSON.parse(cached);
      }

      // Fetch from database
      const data = await fetchFunction();

      // Store in cache
      await client.setEx(key, ttl, JSON.stringify(data));

      return data;
    } catch (error) {
      console.error('Cache error:', error);
      // Fallback to direct fetch if cache fails
      return await fetchFunction();
    }
  };
};

// Usage in service
const getPlanWithCache = async (planId) => {
  return cacheWrapper(`plan:${planId}`, 1800)(async () => {
    return await Plan.findByPk(planId, {
      include: [{ model: PlanOption, as: 'options' }]
    });
  });
};

module.exports = { cacheWrapper, client };
```

## API Documentation Standards

Every endpoint must include:
- Clear description
- Request parameters with types
- Request body schema
- Response codes and schemas
- Example requests/responses
- Authentication requirements

Use Swagger/OpenAPI for interactive documentation.

## Error Handling Standards

```javascript
// utils/ApiError.js
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
  }

  static badRequest(message, errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
```

## Environment Configuration

```javascript
// config/config.js
require('dotenv').config();

module.exports = {
  development: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    }
  }
};
```

## Key Metrics to Monitor

### Performance Metrics
- API response time (target: <500ms)
- Database query time (target: <100ms)
- Cache hit rate (target: >80%)
- Throughput (requests per second)

### Business Metrics
- Job creation rate
- Option validation requests
- Most popular plan/option combinations
- Error rates by endpoint

### Infrastructure Metrics
- CPU usage
- Memory usage
- Database connections
- Redis memory usage
