# Learning Materials Index

Comprehensive learning resources integrated with the Corey Dev Framework for sustainable, session-based learning.

---

## 📚 Quick Access

**Primary Directory:** [learning/](learning/)

**Start Here:** [learning/README.md](learning/README.md) - Complete learning materials overview

**Track Progress:** `python sql_practice.py progress`

---

## 🎯 Available Learning Paths

### SQL & Database Skills

**Location:** [learning/sql/](learning/sql/)

**Time Commitment:** 8 weeks (128 sessions, 64 hours)

**Pace:** 16 sessions per week (5-7.5 hours/week)

**Resources:**

1. **[ROADMAP.md](learning/sql/ROADMAP.md)** - 8-week structured curriculum
   - 30-minute session breakdown
   - 4 phases: Fundamentals → Design → Advanced → PostgreSQL
   - Weekly session planning templates
   - Integration with Corey Dev Framework

2. **[PRACTICE_LAB.md](learning/sql/PRACTICE_LAB.md)** - 50+ hands-on exercises
   - Beginner to advanced progression
   - Construction-specific examples
   - MindFlow schema practice
   - Answers and explanations

3. **[QUICK_REFERENCE.md](learning/sql/QUICK_REFERENCE.md)** - Daily reference guide
   - Top 10 most-used queries
   - Essential JOIN patterns
   - Common WHERE clauses
   - Aggregation templates
   - Error troubleshooting

4. **[CHEAT_SHEET.md](learning/sql/CHEAT_SHEET.md)** - One-page quick lookup
   - Core patterns (90% of work)
   - Schema quick map
   - Printable reference
   - Performance tips

5. **[README.md](learning/sql/README.md)** - Getting started guide
   - Package overview
   - Usage instructions
   - Framework integration
   - Best practices

**Tracking Tool:** `python sql_practice.py`

```bash
python sql_practice.py start "Week 1: SELECT queries"
python sql_practice.py end "Completed exercises 1-5"
python sql_practice.py progress
python sql_practice.py summary
python sql_practice.py stats
```

---

## 🛠️ Framework Integration

All learning materials follow the **Corey Dev Framework** principles:

### Session-Based Learning

**30-minute focused sessions:**
- Set timer for 30 minutes
- Work on one topic or exercise
- Document learnings immediately
- Take 5-10 minute breaks between sessions

**Daily capacity:**
- 2-3 sessions per day (60-90 minutes)
- Never exceed 90 minutes in one day
- Wednesday protected (no sessions)

**Weekly target:**
- 12-16 sessions per week
- 5-7.5 hours total
- Sustainable, consistent pace

### Progress Tracking

**Automated tracking:**
```bash
# Start session
python sql_practice.py start "<topic>"

# Work for 30 minutes

# End session with notes
python sql_practice.py end "<what you learned>"

# View progress anytime
python sql_practice.py progress
```

**Progress metrics:**
- Sessions completed by week
- Time spent on each phase
- Exercises completed (out of 50)
- Learning streak (consecutive days)
- Velocity (sessions per week)

### Friday Review Integration

Include learning progress in your Friday review ritual:

```markdown
## Learning Progress This Week

**SQL Practice:**
- Sessions: 12/16 target
- Time: 6 hours
- Exercises: 15-24 (10 exercises)
- Phase: Week 2 (75% complete)

**Key Learnings:**
- Mastered JOIN operations
- Comfortable with multi-table queries
- Need more practice with subqueries

**Next Week:**
- Complete Week 2 (4 sessions)
- Begin Week 3: Advanced queries
```

---

## 📊 Learning Roadmap Overview

### Week 1: SQL Fundamentals
**Sessions:** 16 (8 hours)
**Topics:**
- SELECT queries and basic filtering
- WHERE clauses and conditions
- ORDER BY and sorting
- Basic aggregate functions (COUNT, SUM, AVG)
- DISTINCT and duplicate handling

**Exercises:** 1-10 from PRACTICE_LAB.md

**Success Criteria:**
- Can write basic SELECT queries
- Understand WHERE filtering
- Comfortable with simple aggregations

---

### Week 2: Joins & Relationships
**Sessions:** 16 (8 hours)
**Topics:**
- INNER JOIN for material hierarchies
- LEFT/RIGHT JOIN for optional relationships
- Multiple table joins
- Self-joins for recursive structures
- JOIN optimization

**Exercises:** 11-20 from PRACTICE_LAB.md

**Success Criteria:**
- Can join multiple tables
- Understand different JOIN types
- Can explain schema relationships

---

### Week 3-4: Advanced Queries
**Sessions:** 32 (16 hours over 2 weeks)
**Topics:**
- Subqueries and nested SELECT
- Common Table Expressions (CTEs)
- Window functions (ROW_NUMBER, RANK)
- Complex aggregations with GROUP BY
- HAVING clause for filtered aggregations
- CASE statements for conditional logic

**Exercises:** 21-35 from PRACTICE_LAB.md

**Success Criteria:**
- Can write complex multi-table queries
- Understand and use CTEs
- Comfortable with window functions

---

### Week 5-8: Database Programming
**Sessions:** 64 (32 hours over 4 weeks)
**Topics:**
- Stored procedures for business logic
- Functions and user-defined functions
- Triggers for data integrity
- Transactions and ACID properties
- Indexes and query optimization
- Backup and recovery strategies
- Security and permissions

**Exercises:** 36-50 from PRACTICE_LAB.md

**Success Criteria:**
- Can create stored procedures
- Understand database optimization
- Ready for production implementation

---

## 🎓 Learning by Experience Level

### Complete Beginner
**Start:** Week 1, Session 1
**Path:** Follow linear progression (Week 1 → 8)
**Resources:**
1. ROADMAP.md - Phase 1
2. PRACTICE_LAB.md - Level 1
3. CHEAT_SHEET.md - Basic patterns

**First Session:**
```bash
python sql_practice.py start "Week 1: First SQL queries"
# Read ROADMAP.md Phase 1
# Complete PRACTICE_LAB.md Exercise 1.1
python sql_practice.py end "Learned basic SELECT syntax"
```

---

### Some SQL Experience
**Start:** Assess current level with PRACTICE_LAB.md
**Path:** Skip to appropriate week based on assessment
**Resources:**
1. ROADMAP.md - Jump to Phase 2 or 3
2. PRACTICE_LAB.md - Start at Level 3 or 4
3. QUICK_REFERENCE.md - Fill knowledge gaps

**Assessment:**
- Can write SELECT with WHERE? → Start Week 2
- Can write JOINs? → Start Week 3
- Can write subqueries? → Start Week 5

---

### Advanced (Just Need Construction Context)
**Start:** Week 5 (Implementation)
**Path:** Focus on schema-specific patterns
**Resources:**
1. QUICK_REFERENCE.md - Production patterns
2. PRACTICE_LAB.md - Level 5 (real-world scenarios)
3. construction_management_platform schema

**Focus:**
- Construction-specific query patterns
- MindFlow schema optimization
- Production implementation

---

## 💡 Learning Tips

### Daily Practice Routine

**Optimal Schedule:**
- **Morning** (1-2 sessions): Fresh mind, best for new concepts
- **Evening** (1 session): Reinforce morning learning
- **Wednesday**: Protected, no sessions

**Session Structure:**
1. 2 min - Review previous session notes
2. 25 min - Focused learning or practice
3. 3 min - Document learnings and next steps

### Maximize Retention

**Spaced Repetition:**
- Review concepts after 1 day, 3 days, 7 days
- Use PRACTICE_LAB.md exercises for review
- Revisit challenging topics in multiple sessions

**Immediate Application:**
- After learning a concept, apply it to construction data
- Practice with your actual schema
- Build real queries for your platform

**Active Learning:**
- Write queries before watching videos
- Predict output before running queries
- Explain concepts in your own words

### Overcome Plateaus

**Feeling Stuck?**
1. Review CHEAT_SHEET.md basics
2. Redo earlier PRACTICE_LAB.md exercises
3. Take a day break, come back fresh
4. Ask specific questions (Stack Overflow, ChatGPT)
5. Move to next topic, circle back later

**Too Easy?**
1. Jump ahead to harder exercises
2. Create your own practice queries
3. Optimize existing queries
4. Help others learn (teach to solidify)

---

## 📈 Progress Milestones

### Week 2 Checkpoint
**You should be able to:**
- ✅ Write SELECT queries to retrieve data
- ✅ Join multiple tables together
- ✅ Understand primary and foreign keys
- ✅ Explain your schema's structure

**If not:** Extend Week 1-2 content before moving on

---

### Week 4 Checkpoint
**You should be able to:**
- ✅ Create and use views
- ✅ Write complex queries with subqueries
- ✅ Understand and use window functions
- ✅ Optimize queries with indexes

**If not:** Review Week 3-4, do more PRACTICE_LAB.md exercises

---

### Week 8 Checkpoint
**You should be able to:**
- ✅ Deploy your schema to production
- ✅ Import all BAT data successfully
- ✅ Query the system for any business question
- ✅ Integrate with your MindFlow platform

**If not:** Extend implementation time, review ROADMAP.md Weeks 5-8

---

## 🔧 Tools & Commands

### Learning Session Management

```bash
# Start learning session
python sql_practice.py start "<topic>"

# End session with notes
python sql_practice.py end "<what you accomplished>"

# Mark exercise complete
python sql_practice.py exercise <number>

# View overall progress
python sql_practice.py progress

# Weekly summary (for Friday review)
python sql_practice.py summary

# Statistics and streak
python sql_practice.py stats

# Move to next week
python sql_practice.py next-week
```

### Quick Reference Access

```bash
# View learning materials
cd learning/sql

# Read roadmap
cat ROADMAP.md | less

# Read quick reference
cat QUICK_REFERENCE.md | less

# Open practice lab
vim PRACTICE_LAB.md
```

---

## 📅 Sample Weekly Schedule

### Week 1 Example

**Monday** (90 min = 3 sessions)
- Session 1: Read ROADMAP.md Phase 1
- Session 2: Complete PRACTICE_LAB.md Exercise 1.1-1.2
- Session 3: Practice SELECT queries with construction data

**Tuesday** (90 min = 3 sessions)
- Session 4: WHERE clause practice
- Session 5: Complete exercises 1.3-1.4
- Session 6: Apply to MindFlow schema

**Wednesday** (Protected - No sessions)
- Caregiving day

**Thursday** (90 min = 3 sessions)
- Session 7: Aggregate functions (COUNT, SUM, AVG)
- Session 8: Complete exercises 2.1-2.2
- Session 9: GROUP BY practice

**Friday** (60 min = 2 sessions)
- Session 10: Complete exercises 2.3-2.4
- Session 11: Review week's learnings
- Friday review ritual (15 min)

**Weekend** (Optional 2-4 sessions)
- Catch-up if needed
- Extra practice on challenging topics
- Get ahead on next week

**Total:** 11-15 sessions, 5.5-7.5 hours

---

## 🎯 Next Steps

### New to SQL?
1. Read [learning/sql/README.md](learning/sql/README.md)
2. Review [learning/sql/ROADMAP.md](learning/sql/ROADMAP.md) Week 1
3. Start first session: `python sql_practice.py start "Week 1: Phase 1"`
4. Complete [PRACTICE_LAB.md](learning/sql/PRACTICE_LAB.md) Exercise 1.1

### Ready to Start?
```bash
# Create your first learning session
python sql_practice.py start "Week 1: Learning SQL basics"

# Read the getting started guide
cat learning/sql/README.md

# Start with first exercise
# Open learning/sql/PRACTICE_LAB.md

# After 30 minutes
python sql_practice.py end "Completed first SELECT queries"
```

### Track Your Journey
```bash
# Check progress anytime
python sql_practice.py progress

# View this week's summary
python sql_practice.py summary

# See all your stats
python sql_practice.py stats
```

---

## 📞 Need Help?

**Quick Questions:**
- Check [CHEAT_SHEET.md](learning/sql/CHEAT_SHEET.md) for syntax
- Review [QUICK_REFERENCE.md](learning/sql/QUICK_REFERENCE.md) for patterns

**Learning Path Questions:**
- See [ROADMAP.md](learning/sql/ROADMAP.md) for curriculum details
- Check [README.md](learning/sql/README.md) for usage guide

**Practice Questions:**
- [PRACTICE_LAB.md](learning/sql/PRACTICE_LAB.md) includes answers
- Exercises progress from easy to advanced

**Stuck on Concepts:**
- External resources listed in ROADMAP.md
- SQLBolt.com (interactive)
- PostgreSQL documentation
- Stack Overflow

---

## 🌟 Success Philosophy

**Consistency > Intensity:**
Better to do 2-3 short sessions daily than one long marathon session weekly.

**Progress > Perfection:**
It's okay to move on before mastering everything. You'll circle back.

**Application > Theory:**
Learn → Practice → Apply to real project immediately.

**Sustainable Pace:**
Respect the 30-minute limit. Learning compounds over time.

**Track Everything:**
Use `sql_practice.py` religiously. Data shows progress when it feels slow.

---

**Ready to start your learning journey?** 🚀

```bash
python sql_practice.py start "Beginning my SQL learning journey"
```

---

**Version:** 1.0
**Last Updated:** November 15, 2025
**Framework:** Corey Dev Framework v1.0
**Total Learning Paths:** 1 (SQL & Database Skills)
**Future Additions:** TypeScript, React, PostgreSQL, Testing, DevOps
