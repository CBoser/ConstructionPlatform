---
name: construction-ui-components
description: Specialized skill for building React UI components for the construction project management platform. Use when creating interfaces for dashboard, job management, plan specification (40 plans, 567 options selector), schedule board, PDSS tracking, subdivision portfolio (31 subdivisions), or contract management. Includes component patterns, state management, form handling, real-time updates, and mobile-responsive designs specific to construction workflows.
---

# Construction UI Components

Comprehensive guide for building the frontend React components for the integrated construction project management platform.

## Technology Stack

### Core Libraries
- **Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router v6
- **UI Framework**: Material-UI (MUI) v5
- **Forms**: React Hook Form with Yup validation
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Real-time**: Socket.io-client
- **Testing**: Jest + React Testing Library

### Project Structure
```
/frontend
├── /src
│   ├── /components
│   │   ├── /common         # Reusable components
│   │   ├── /dashboard      # Dashboard widgets
│   │   ├── /jobs           # Job management
│   │   ├── /plans          # Plan/option selection
│   │   ├── /schedule       # Schedule board
│   │   └── /subdivisions   # Subdivision management
│   ├── /features           # Redux slices
│   ├── /hooks              # Custom hooks
│   ├── /services           # API services
│   ├── /utils              # Helper functions
│   ├── /types              # TypeScript types
│   └── /styles             # Global styles
└── /public
```

## Component Design System

### Color Palette
```typescript
// theme/palette.ts
export const palette = {
  primary: {
    main: '#1976d2',      // Professional blue
    light: '#42a5f5',
    dark: '#1565c0',
  },
  secondary: {
    main: '#ff9800',      // Construction orange
    light: '#ffb74d',
    dark: '#f57c00',
  },
  status: {
    planStart: '#9c27b0',       // Purple
    pdssInitiated: '#3f51b5',   // Indigo
    planReview: '#2196f3',      // Blue
    approved: '#4caf50',        // Green
    inProduction: '#ff9800',    // Orange
    qualityCheck: '#ff5722',    // Deep Orange
    completed: '#8bc34a',       // Light Green
    onHold: '#ffc107',          // Amber
    cancelled: '#9e9e9e',       // Grey
  },
  priority: {
    low: '#9e9e9e',
    medium: '#ff9800',
    high: '#ff5722',
    urgent: '#f44336',
  },
};
```

### Typography
```typescript
// theme/typography.ts
export const typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 500,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 500,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 500,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  button: {
    textTransform: 'none' as const,  // Don't uppercase buttons
  },
};
```

## Core Components

### 1. Dashboard Component

```typescript
// components/dashboard/Dashboard.tsx
import React, { useEffect } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardData } from '../../features/dashboard/dashboardSlice';
import JobStatusChart from './JobStatusChart';
import ActiveJobsWidget from './ActiveJobsWidget';
import SubdivisionOverview from './SubdivisionOverview';
import RecentActivity from './RecentActivity';
import PerformanceMetrics from './PerformanceMetrics';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Key Metrics Row */}
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Active Jobs"
            value={data.activeJobs}
            icon={<WorkIcon />}
            trend={data.jobsTrend}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Plans in Review"
            value={data.plansInReview}
            icon={<DescriptionIcon />}
            trend={data.reviewTrend}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Subdivisions"
            value="31"
            icon={<LocationCityIcon />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Completion Rate"
            value={`${data.completionRate}%`}
            icon={<CheckCircleIcon />}
            trend={data.completionTrend}
          />
        </Grid>

        {/* Job Status Distribution */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Job Status Distribution
            </Typography>
            <JobStatusChart data={data.statusDistribution} />
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400, overflow: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Activity
            </Typography>
            <RecentActivity activities={data.recentActivities} />
          </Paper>
        </Grid>

        {/* Active Jobs Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Active Jobs
            </Typography>
            <ActiveJobsWidget jobs={data.activeJobsList} />
          </Paper>
        </Grid>

        {/* Subdivision Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Subdivision Portfolio
            </Typography>
            <SubdivisionOverview subdivisions={data.subdivisions} />
          </Paper>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Performance Metrics
            </Typography>
            <PerformanceMetrics metrics={data.performance} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
```

### 2. Plan Option Selector Component

```typescript
// components/plans/PlanOptionSelector.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Grid,
  Button,
  Dialog,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { usePlanOptions } from '../../hooks/usePlanOptions';
import { validateOptions } from '../../services/planService';

interface PlanOptionSelectorProps {
  planId: string;
  elevation: string;
  initialSelectedOptions?: string[];
  onSelectionChange: (selectedOptions: string[]) => void;
}

const PlanOptionSelector: React.FC<PlanOptionSelectorProps> = ({
  planId,
  elevation,
  initialSelectedOptions = [],
  onSelectionChange,
}) => {
  const { options, loading } = usePlanOptions(planId);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(initialSelectedOptions);
  const [validation, setValidation] = useState<any>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Group options by category
  const optionsByCategory = options.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = [];
    }
    acc[option.category].push(option);
    return acc;
  }, {} as Record<string, typeof options>);

  // Validate selections whenever they change
  useEffect(() => {
    const validate = async () => {
      if (selectedOptions.length > 0) {
        const result = await validateOptions(planId, selectedOptions, elevation);
        setValidation(result);
      } else {
        setValidation(null);
      }
    };
    validate();
  }, [selectedOptions, planId, elevation]);

  const handleOptionToggle = (optionCode: string) => {
    const newSelection = selectedOptions.includes(optionCode)
      ? selectedOptions.filter(code => code !== optionCode)
      : [...selectedOptions, optionCode];
    
    setSelectedOptions(newSelection);
    onSelectionChange(newSelection);
  };

  const isOptionDisabled = (option: any): boolean => {
    // Disable if not available for selected elevation
    if (option.availableElevations.length > 0 && 
        !option.availableElevations.includes(elevation)) {
      return true;
    }

    // Disable if conflicts with selected options
    const hasConflict = option.conflictingOptions.some(code =>
      selectedOptions.includes(code)
    );
    if (hasConflict) return true;

    return false;
  };

  const getOptionStatus = (option: any): string | null => {
    // Check if unavailable for elevation
    if (option.availableElevations.length > 0 && 
        !option.availableElevations.includes(elevation)) {
      return `Not available for elevation ${elevation}`;
    }

    // Check for conflicts
    const conflicts = option.conflictingOptions.filter(code =>
      selectedOptions.includes(code)
    );
    if (conflicts.length > 0) {
      return `Conflicts with: ${conflicts.join(', ')}`;
    }

    // Check for missing requirements
    const missingReqs = option.requiredOptions.filter(code =>
      !selectedOptions.includes(code)
    );
    if (missingReqs.length > 0) {
      return `Requires: ${missingReqs.join(', ')}`;
    }

    return null;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      {/* Validation Messages */}
      {validation && !validation.isValid && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">
            Please resolve the following issues:
          </Typography>
          <ul>
            {validation.errors.map((error: any, idx: number) => (
              <li key={idx}>{error.message}</li>
            ))}
          </ul>
        </Alert>
      )}

      {validation && validation.warnings.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Warnings:</Typography>
          <ul>
            {validation.warnings.map((warning: any, idx: number) => (
              <li key={idx}>{warning.message}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Recommendations */}
      {validation && validation.recommendations.length > 0 && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => setShowRecommendations(true)}
            >
              VIEW
            </Button>
          }
        >
          {validation.recommendations.length} recommended options available
        </Alert>
      )}

      {/* Option Selection by Category */}
      {Object.entries(optionsByCategory).map(([category, categoryOptions]) => (
        <Accordion key={category} defaultExpanded={category === 'exterior'}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
              {category.replace('_', ' ')}
              <Chip 
                label={categoryOptions.filter(opt => 
                  selectedOptions.includes(opt.optionCode)
                ).length}
                size="small"
                sx={{ ml: 2 }}
              />
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {categoryOptions.map(option => {
                const isDisabled = isOptionDisabled(option);
                const isSelected = selectedOptions.includes(option.optionCode);
                const status = getOptionStatus(option);

                return (
                  <Grid item xs={12} sm={6} md={4} key={option.optionCode}>
                    <Card 
                      variant="outlined"
                      sx={{
                        opacity: isDisabled ? 0.5 : 1,
                        borderColor: isSelected ? 'primary.main' : undefined,
                        borderWidth: isSelected ? 2 : 1,
                      }}
                    >
                      <CardContent>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleOptionToggle(option.optionCode)}
                              disabled={isDisabled}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="subtitle2">
                                {option.optionName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.optionCode}
                              </Typography>
                              {option.impactsSchedule && (
                                <Chip 
                                  label={`+${option.leadTimeDays}d`}
                                  size="small"
                                  color="warning"
                                  sx={{ ml: 1 }}
                                />
                              )}
                              {option.requiresEngineering && (
                                <Chip 
                                  label="Engineering"
                                  size="small"
                                  color="info"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                          }
                        />
                        {option.description && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ mt: 1, ml: 4 }}
                          >
                            {option.description}
                          </Typography>
                        )}
                        {status && (
                          <Alert severity="warning" sx={{ mt: 1, py: 0 }}>
                            <Typography variant="caption">{status}</Typography>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Recommendations Dialog */}
      <Dialog 
        open={showRecommendations} 
        onClose={() => setShowRecommendations(false)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Recommended Options
          </Typography>
          <Grid container spacing={2}>
            {validation?.recommendations.map((rec: any) => (
              <Grid item xs={12} sm={6} key={rec.optionCode}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2">{rec.optionName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {rec.reason}
                    </Typography>
                    <Button
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => {
                        handleOptionToggle(rec.optionCode);
                        setShowRecommendations(false);
                      }}
                    >
                      Add to Selection
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Dialog>

      {/* Selection Summary */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Selection Summary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {selectedOptions.length} options selected
        </Typography>
        {validation && validation.warnings.some((w: any) => w.type === 'SCHEDULE_IMPACT') && (
          <Typography variant="body2" color="warning.main">
            ⚠ Estimated schedule impact: +
            {validation.warnings.find((w: any) => w.type === 'SCHEDULE_IMPACT')?.additionalDays} days
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default PlanOptionSelector;
```

### 3. Job Schedule Board Component

```typescript
// components/schedule/ScheduleBoard.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useJobs } from '../../hooks/useJobs';
import { updateJobStatus } from '../../services/jobService';

const statusColumns = [
  { id: 'plan_start', label: 'Plan Start', color: '#9c27b0' },
  { id: 'pdss_initiated', label: 'PDSS Initiated', color: '#3f51b5' },
  { id: 'plan_review', label: 'Plan Review', color: '#2196f3' },
  { id: 'approved', label: 'Approved', color: '#4caf50' },
  { id: 'in_production', label: 'In Production', color: '#ff9800' },
  { id: 'quality_check', label: 'Quality Check', color: '#ff5722' },
  { id: 'completed', label: 'Completed', color: '#8bc34a' },
];

const ScheduleBoard: React.FC = () => {
  const { jobs, loading, updateJob } = useJobs();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const jobId = result.draggableId;
    const newStatus = result.destination.droppableId;

    try {
      await updateJobStatus(jobId, newStatus);
      updateJob(jobId, { status: newStatus });
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const jobsByStatus = statusColumns.reduce((acc, column) => {
    acc[column.id] = jobs.filter(job => job.status === column.id);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" sx={{ mb: 3 }}>
        Schedule Board
      </Typography>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
          {statusColumns.map(column => (
            <Droppable droppableId={column.id} key={column.id}>
              {(provided, snapshot) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    minWidth: 280,
                    bgcolor: snapshot.isDraggingOver ? 'action.hover' : 'background.default',
                    borderRadius: 1,
                    p: 2,
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      pb: 1,
                      borderBottom: `3px solid ${column.color}`,
                    }}
                  >
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {column.label}
                    </Typography>
                    <Chip 
                      label={jobsByStatus[column.id]?.length || 0}
                      size="small"
                      sx={{ bgcolor: column.color, color: 'white' }}
                    />
                  </Box>

                  <Box sx={{ minHeight: 400 }}>
                    {jobsByStatus[column.id]?.map((job, index) => (
                      <Draggable 
                        key={job.id} 
                        draggableId={job.id} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              mb: 2,
                              cursor: 'grab',
                              opacity: snapshot.isDragging ? 0.8 : 1,
                              transform: snapshot.isDragging 
                                ? 'rotate(2deg)' 
                                : 'none',
                            }}
                            onClick={() => {
                              setSelectedJob(job);
                              setShowJobDetails(true);
                            }}
                          >
                            <Box sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'start', mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ flex: 1 }}>
                                  {job.jobNumber}
                                </Typography>
                                <Chip
                                  label={job.priority}
                                  size="small"
                                  color={
                                    job.priority === 'urgent' ? 'error' :
                                    job.priority === 'high' ? 'warning' :
                                    'default'
                                  }
                                />
                              </Box>

                              <Typography variant="body2" color="text.secondary">
                                {job.subdivision.subdivisionName}
                              </Typography>
                              
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                Lot {job.lotNumber}
                              </Typography>

                              <Typography variant="caption" color="text.secondary">
                                {job.plan.planName} - {job.elevation}
                              </Typography>

                              {job.flags && job.flags.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                  {job.flags.map((flag: string) => (
                                    <Chip
                                      key={flag}
                                      label={flag.replace('_', ' ')}
                                      size="small"
                                      color="warning"
                                      sx={{ mr: 0.5, mt: 0.5 }}
                                    />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                </Box>
              )}
            </Droppable>
          ))}
        </Box>
      </DragDropContext>

      {/* Job Details Dialog */}
      <JobDetailsDialog
        job={selectedJob}
        open={showJobDetails}
        onClose={() => setShowJobDetails(false)}
      />
    </Box>
  );
};

export default ScheduleBoard;
```

## Custom Hooks

### useRealTimeUpdates Hook
```typescript
// hooks/useRealTimeUpdates.ts
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { updateJob, addNotification } from '../features/jobs/jobsSlice';

let socket: Socket | null = null;

export const useRealTimeUpdates = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize socket connection
    if (!socket) {
      socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001', {
        auth: {
          token: localStorage.getItem('token'),
        },
      });
    }

    // Listen for job updates
    socket.on('job:updated', (data) => {
      dispatch(updateJob(data));
      dispatch(addNotification({
        type: 'info',
        message: `Job ${data.jobNumber} updated`,
      }));
    });

    // Listen for new jobs
    socket.on('job:created', (data) => {
      dispatch(addNotification({
        type: 'success',
        message: `New job ${data.jobNumber} created`,
      }));
    });

    // Listen for PDSS updates
    socket.on('pdss:status_changed', (data) => {
      dispatch(addNotification({
        type: 'info',
        message: `PDSS status updated for job ${data.jobNumber}`,
      }));
    });

    return () => {
      socket?.off('job:updated');
      socket?.off('job:created');
      socket?.off('pdss:status_changed');
    };
  }, [dispatch]);

  return socket;
};
```

## Form Handling Pattern

```typescript
// components/jobs/CreateJobForm.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const schema = yup.object({
  jobNumber: yup.string().required('Job number is required'),
  lotNumber: yup.string().required('Lot number is required'),
  subdivisionId: yup.string().required('Subdivision is required'),
  planId: yup.string().required('Plan is required'),
  elevation: yup.string().required('Elevation is required'),
  clientName: yup.string().required('Client name is required'),
  clientEmail: yup.string().email('Invalid email'),
  priority: yup.string().oneOf(['low', 'medium', 'high', 'urgent']),
}).required();

const CreateJobForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      priority: 'medium',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      // API call to create job
      console.log('Creating job:', data);
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="jobNumber"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Job Number"
            error={!!errors.jobNumber}
            helperText={errors.jobNumber?.message}
            fullWidth
            sx={{ mb: 2 }}
          />
        )}
      />

      {/* Additional form fields... */}

      <Button type="submit" variant="contained" fullWidth>
        Create Job
      </Button>
    </Box>
  );
};
```

## Responsive Design Patterns

### Mobile-First Grid Layout
```typescript
<Grid container spacing={{ xs: 2, md: 3 }}>
  <Grid item xs={12} sm={6} md={4} lg={3}>
    {/* Component */}
  </Grid>
</Grid>
```

### Conditional Rendering for Mobile
```typescript
import { useMediaQuery, useTheme } from '@mui/material';

const MyComponent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box>
      {isMobile ? (
        <MobileView />
      ) : (
        <DesktopView />
      )}
    </Box>
  );
};
```

## Performance Optimization

### Memoization
```typescript
import React, { useMemo } from 'react';

const ExpensiveComponent = ({ jobs }) => {
  const sortedJobs = useMemo(() => {
    return jobs.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [jobs]);

  return <>{/* Render sorted jobs */}</>;
};
```

### Virtual Scrolling for Large Lists
```typescript
import { FixedSizeList } from 'react-window';

const VirtualJobList = ({ jobs }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <JobCard job={jobs[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={jobs.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

## Testing Standards

```typescript
// components/__tests__/PlanOptionSelector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import PlanOptionSelector from '../PlanOptionSelector';

describe('PlanOptionSelector', () => {
  it('renders all option categories', () => {
    render(<PlanOptionSelector planId="123" elevation="A" />);
    
    expect(screen.getByText('Exterior')).toBeInTheDocument();
    expect(screen.getByText('Interior')).toBeInTheDocument();
  });

  it('disables conflicting options', () => {
    render(<PlanOptionSelector planId="123" elevation="A" />);
    
    const hardwoodCheckbox = screen.getByLabelText('Hardwood Floors');
    fireEvent.click(hardwoodCheckbox);

    const carpetCheckbox = screen.getByLabelText('Carpet');
    expect(carpetCheckbox).toBeDisabled();
  });
});
```
