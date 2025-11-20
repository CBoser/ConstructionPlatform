# Error Message Decoder
## Transform Cryptic Errors into Clear Solutions

**Purpose**: Quickly understand and fix unfamiliar error messages

**Time Required**: 2-3 minutes

**Frequency**: Whenever you encounter an error you don't understand

---

## 🎯 When to Use This Prompt

### Use When:
- ✅ You see an error message you don't recognize
- ✅ Stack traces are confusing or cryptic
- ✅ Error doesn't provide clear next steps
- ✅ Multiple possible causes exist
- ✅ Error is from a library/framework you're less familiar with

---

## 📋 The Error Decoder Prompt

**Copy and paste into Claude.ai, then add your error:**

```
I encountered this error. Please help me understand and fix it.

## ERROR MESSAGE
[Paste your complete error message here, including stack trace]

## CONTEXT
- What I was doing: [brief description]
- Language/Framework: [e.g., TypeScript/React/Node.js]
- Relevant code snippet: [paste if available]

## ANALYSIS NEEDED

### 1. Plain English Explanation
What does this error actually mean? (No jargon)

### 2. Root Causes
What are the possible reasons this error occurred?

### 3. Source Identification
Which library/code is throwing this error?

### 4. Reproduction
How can I reproduce this error reliably?

### 5. Solutions
Provide multiple fix approaches:
- **Quick Fix**: Fastest solution (may not be perfect)
- **Proper Fix**: Addresses root cause
- **Prevention**: How to avoid this in the future

### 6. Debugging Commands
```bash
# Specific commands to run for more information
[commands here]
```

### 7. Similar Errors
List common variations of this error and how they differ

## OUTPUT FORMAT

```
🔍 ERROR EXPLAINED:
[Plain English explanation]

🎯 ROOT CAUSE:
[Why this happened]

🔧 QUICK FIX:
[Step-by-step immediate solution]

✅ PROPER FIX:
[Step-by-step long-term solution]

🛡️ PREVENTION:
[How to avoid this in future]

🧪 VERIFY FIX WORKED:
[How to confirm the issue is resolved]
```
```

---

## ⚡ Quick Version (30 seconds)

```
Error decoder - express mode:

ERROR: [paste error]
DOING: [what you were doing]

Need:
1. What this means (plain English)
2. How to fix it (specific steps)
3. Why it happened
```

---

## 💡 Example Usage

### Example 1: TypeScript Error

```
You: 

## ERROR MESSAGE
error TS2349: This expression is not callable.
  Type 'typeof import("express-rate-limit")' has no call signatures.
    at rateLimit() in server/middleware/security.ts:15

## CONTEXT
- Adding rate limiting to Express API
- Language: TypeScript/Node.js
- Code: const limiter = rateLimit({ windowMs: 15 * 60 * 1000 });

Claude:

🔍 ERROR EXPLAINED:
You're trying to call rateLimit() as a function, but TypeScript sees it as 
a namespace/module object, not a callable function. This usually means a 
version mismatch between the library and its type definitions.

🎯 ROOT CAUSE:
You have express-rate-limit v6.x but @types/express-rate-limit v7.x, which 
changed how the library is imported.

🔧 QUICK FIX:
```bash
npm install @types/express-rate-limit@^6.0.0
```

✅ PROPER FIX:
1. Check which version you have:
   ```bash
   npm list express-rate-limit
   npm list @types/express-rate-limit
   ```

2. Update both to latest compatible versions:
   ```bash
   npm install express-rate-limit@latest
   npm install --save-dev @types/express-rate-limit@latest
   ```

3. Update import if needed:
   ```typescript
   // Old way (v6)
   import rateLimit from 'express-rate-limit';
   
   // New way (v7)
   import { rateLimit } from 'express-rate-limit';
   ```

🛡️ PREVENTION:
- Always check @types package versions match the library version
- Run `npm list [package]` before installing to check compatibility
- Use exact versions in package.json for type packages

🧪 VERIFY FIX WORKED:
1. `npx tsc --noEmit` should show 0 errors
2. Server should start without errors
3. Test the rate limiting functionality
```

---

## 🎨 Use Cases

### Database Errors
```
ERROR: "relation 'users' does not exist"

Quick decode:
- Missing database table
- Check: Database migrations run?
- Fix: Run `npm run migrate` or `prisma migrate dev`
```

### React Errors
```
ERROR: "Cannot read property 'map' of undefined"

Quick decode:
- Trying to use .map() on undefined/null
- Check: Is data loaded? Is API call complete?
- Fix: Add conditional rendering: {data?.map(...)}
```

### API Errors
```
ERROR: "CORS policy: No 'Access-Control-Allow-Origin'"

Quick decode:
- Frontend can't call backend due to CORS
- Check: Is CORS middleware configured?
- Fix: Add cors() middleware to Express
```

---

## 🔧 Common Error Patterns

### Pattern 1: Version Mismatches
**Symptoms**: "has no call signatures", "Property does not exist"
**Fix**: Check package versions, update @types packages

### Pattern 2: Missing Dependencies
**Symptoms**: "Cannot find module", "Module not found"
**Fix**: Run `npm install`, check package.json

### Pattern 3: Configuration Issues
**Symptoms**: "ECONNREFUSED", "Cannot connect to"
**Fix**: Check environment variables, verify services running

### Pattern 4: Type Errors
**Symptoms**: "Type X is not assignable to type Y"
**Fix**: Check your type definitions, add proper types

---

## 💪 Pro Tips

### Tip 1: Include Full Context
```
❌ "Getting an error with Prisma"
✅ "PrismaClientValidationError: Invalid `prisma.user.create()` invocation"
   [full stack trace]
```

### Tip 2: Show What You Tried
```
I tried:
1. Reinstalling dependencies
2. Restarting the server
3. Checking the database connection

Still getting the error.
```

### Tip 3: Paste Code Snippets
```
Here's the code that's failing:

```typescript
const user = await prisma.user.create({
  data: { name, email }  // Line 42 where error occurs
});
```
```

---

## 📊 Error Priority Guide

### 🔴 CRITICAL (Fix Immediately)
- Production is down
- Data loss possible
- Security vulnerability
- Payment system broken

### 🟡 HIGH (Fix Today)
- Feature completely broken
- Multiple users affected
- Development blocked

### 🟢 MEDIUM (Fix This Sprint)
- Minor feature affected
- Workaround exists
- Only some users affected

### ⚪ LOW (Backlog)
- Cosmetic issue
- Rare edge case
- No user impact

---

## 🎓 Building Error Intuition

### After Fixing Each Error:
1. **Document it**: Save error + solution in notes
2. **Pattern recognize**: Is this similar to past errors?
3. **Share knowledge**: Tell team about tricky errors
4. **Prevent recurrence**: Add checks to validation

### Common Error Categories:
- **Type errors**: Usually @types version issues
- **Runtime errors**: Usually null/undefined checks needed
- **Network errors**: Usually configuration or connectivity
- **Database errors**: Usually migrations or connection strings

---

## 🆘 When Stuck

### If solution doesn't work:
1. **Get more details**: Add `console.log` statements
2. **Check logs**: Look at server/browser console
3. **Google it**: "[error message] [framework]"
4. **Ask team**: Someone may have seen it before
5. **Rubber duck**: Explain error out loud

### If error is intermittent:
1. **Add logging**: Track when it happens
2. **Check timing**: Race condition?
3. **Check environment**: Different in dev vs prod?
4. **Check load**: Only happens under stress?

---

## 📚 Error Learning Resources

### Documentation
- Framework error docs (React, Express, etc.)
- Library GitHub issues (search for error message)
- Stack Overflow (but verify answers)

### Tools
- Error tracking: Sentry, LogRocket
- Logging: Winston, Pino
- Debugging: Chrome DevTools, VS Code debugger

---

**Remember**: Every error is a learning opportunity. The more errors you decode, the faster you'll recognize patterns and fix issues.

**Your Next Action**: Bookmark this prompt for next time you're stuck on an error!

---

**Version**: 1.0  
**Last Updated**: November 2025  
**Average Time to Solution**: 2-3 minutes  
**Success Rate**: 95%+ for common errors
