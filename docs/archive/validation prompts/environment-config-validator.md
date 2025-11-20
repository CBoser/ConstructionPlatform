# Environment Config Validator
## Validate Environment Variables

**Purpose**: Audit environment configuration across environments

**Time Required**: 10 minutes

**Frequency**: Before deployment, when "works on my machine"

---

## 📋 Environment Config Prompt

```
Validate environment variable setup.

## REQUIRED CHECKS

### 1. Find All Env Vars Used
```bash
grep -r "process.env" src/ | cut -d: -f2 | sort -u
```

### 2. Check .env.example Complete
Compare found vars vs .env.example

### 3. Check Production Config
Verify .env.production has all required vars

### 4. Find Hardcoded Values
```bash
grep -r "localhost\|127.0.0.1" src/
grep -r "http://" src/ | grep -v "https://"
```

## SECURITY AUDIT

❌ Secrets in code?
❌ API keys in client-side?
❌ Default values in production?
⚠️ Dev secrets in production?

## DOCUMENTATION CHECK

- [ ] README explains .env setup
- [ ] All vars documented
- [ ] Example values provided
- [ ] Production setup documented

## OUTPUT

Environment Variable Audit:
- Missing from .env.example: [list]
- Undocumented: [list]
- Security risks: [list]
- Recommendations: [action items]
```

---

**Version**: 1.0  
**Time**: 10 minutes
