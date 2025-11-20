# Test Coverage Gap Finder
## Identify What Needs Testing

**Purpose**: Find untested code and prioritize testing work

**Time Required**: 15 minutes

**Frequency**: Weekly (mid-week recommended)

---

## 📋 The Test Coverage Prompt

```
Analyze test coverage and identify gaps. Prioritize what to test next.

## CURRENT COVERAGE ANALYSIS

Run coverage report:
```bash
npm run test:coverage
# or
npx jest --coverage
# or  
npx vitest --coverage
```

Report:
- Overall coverage: ___%
- Statements: ___%
- Branches: ___%
- Functions: ___%
- Lines: ___%

## IDENTIFY GAPS

### Critical Uncovered Code (Priority 1)
List functions with:
- Business logic + 0% coverage
- External API calls + no tests
- Database operations + no tests
- Authentication/authorization + no tests
- Payment processing + no tests

### Important Uncovered Code (Priority 2)
- Complex conditionals (>3 branches) + no tests
- Functions >50 lines + no tests
- Error handling + no tests
- Data transformations + no tests

### Nice to Have (Priority 3)
- Simple getters/setters
- UI components
- Utilities with low complexity

## GENERATE TEST TEMPLATES

For top 5 priority gaps, create test templates:

```typescript
describe('FunctionName', () => {
  it('should handle happy path', () => {
    // Arrange
    const input = ...
    
    // Act
    const result = functionName(input)
    
    // Assert
    expect(result).toBe(...)
  })
  
  it('should handle error case', () => {
    // Test error handling
  })
  
  it('should handle edge case', () => {
    // Test boundaries
  })
})
```

## ESTIMATE EFFORT

For each gap:
- Complexity: Simple/Medium/Complex
- Est. time: X hours
- Required mocks: [list]
- Test data needed: [describe]

## OUTPUT

1. **Priority List** (top 10 functions to test)
2. **Test Templates** (ready to fill in)
3. **Weekly Goal** (aim for +5% coverage)
4. **Estimated Time** (total hours needed)
```

---

**Version**: 1.0  
**Time**: 15 minutes  
**Output**: Prioritized test backlog
