# Make Prompt Reusable
## Transform Specific Prompts to General

**Purpose**: Improve prompt reusability across projects

**Time Required**: 15 minutes

---

## 📋 Reusability Analysis Prompt

```
Analyze this prompt for reusability and improve it.

[PASTE YOUR PROMPT HERE]

## ANALYSIS

### Reusability Score (1-5 stars)
Current: ⭐⭐⭐ [explain rating]

### Issues Found
- Project-specific terms: [list]
- Hardcoded paths: [list]
- Assumptions: [list]
- Missing variables: [list]

### Improvements Needed
1. Remove project-specific details
2. Add placeholders: [var1], [var2]
3. Create quick/full modes
4. Add output format spec
5. Include time estimates
6. Add "Skip if" conditions

## REWRITTEN PROMPT

[Improved general version with variables]

## USAGE GUIDE

When to use: [scenarios]
How to customize: [steps]
Variables to replace: [list]

## VALIDATION

Test on 3 different projects: [results]
```

---

**Version**: 1.0  
**Time**: 15 minutes
