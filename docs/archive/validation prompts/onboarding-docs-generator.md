# Onboarding Documentation Generator
## Auto-Generate Project Documentation

**Purpose**: Create README and CONTRIBUTING docs from codebase

**Time Required**: 30 minutes

**Frequency**: When onboarding team members

---

## 📋 Onboarding Docs Prompt

```
Analyze codebase and generate onboarding documentation.

## ANALYZE CODEBASE

From the code, extract:
1. Tech stack (languages, frameworks)
2. Project structure (folders)
3. Entry points (main files)
4. Environment setup (env vars needed)
5. Key concepts (domain terms)
6. Dependencies (what to install)

## GENERATE README.md

Sections:
1. **What This Project Does**
2. **Prerequisites** (Node version, tools)
3. **Installation** (step-by-step)
4. **Running Locally** (dev, test, build)
5. **Project Structure** (folder guide)
6. **Key Concepts** (domain glossary)
7. **Common Tasks** (how-tos)
8. **Troubleshooting** (common issues)

## GENERATE CONTRIBUTING.md

Sections:
1. **Code Style** (conventions used)
2. **Git Workflow** (branch strategy)
3. **Testing Requirements**
4. **PR Checklist**
5. **Getting Help**

## OUTPUT

Two complete markdown files ready to commit.
```

---

**Version**: 1.0  
**Time**: 30 minutes  
**Output**: README + CONTRIBUTING docs
