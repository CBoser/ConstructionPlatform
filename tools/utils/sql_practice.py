#!/usr/bin/env python3
"""
SQL Practice Session Tracker
Tracks SQL learning sessions following the Corey Dev Framework (30-minute sessions)

Usage:
    python sql_practice.py start "<topic>"           # Start learning session
    python sql_practice.py end "<notes>"             # End session, update progress
    python sql_practice.py progress                  # View progress through roadmap
    python sql_practice.py summary                   # Weekly summary
    python sql_practice.py stats                     # Overall statistics

Integrates with:
- Corey Dev Framework 30-minute sessions
- SQL learning roadmap (8 weeks, 4 phases)
- Friday review rituals
"""

import sys
import json
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional

# ANSI color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

# SQL Learning Roadmap Structure (aligned with ROADMAP.md)
LEARNING_PHASES = {
    "Week 1": {
        "phase": "Phase 1: SQL Fundamentals",
        "sessions_target": 16,  # 8 hours = 16 sessions
        "topics": [
            "SELECT statements and basic queries",
            "WHERE clauses and filtering",
            "ORDER BY and sorting",
            "Basic aggregate functions (COUNT, SUM, AVG)",
            "DISTINCT and handling duplicates"
        ],
        "exercises": list(range(1, 11))  # Exercises 1-10
    },
    "Week 2": {
        "phase": "Phase 2: Joins and Relationships",
        "sessions_target": 16,
        "topics": [
            "INNER JOIN for material hierarchies",
            "LEFT/RIGHT JOIN for optional relationships",
            "Multiple table joins",
            "Self-joins for recursive structures",
            "JOIN optimization"
        ],
        "exercises": list(range(11, 21))  # Exercises 11-20
    },
    "Week 3-4": {
        "phase": "Phase 3: Advanced Queries",
        "sessions_target": 32,
        "topics": [
            "Subqueries and nested SELECT",
            "Common Table Expressions (CTEs)",
            "Window functions (ROW_NUMBER, RANK)",
            "Complex aggregations with GROUP BY",
            "HAVING clause for filtered aggregations",
            "CASE statements for conditional logic"
        ],
        "exercises": list(range(21, 36))  # Exercises 21-35
    },
    "Week 5-8": {
        "phase": "Phase 4: Database Programming",
        "sessions_target": 64,
        "topics": [
            "Stored procedures for business logic",
            "Functions and user-defined functions",
            "Triggers for data integrity",
            "Transactions and ACID properties",
            "Indexes and query optimization",
            "Backup and recovery strategies",
            "Security and permissions"
        ],
        "exercises": list(range(36, 51))  # Exercises 36-50
    }
}

class SQLPracticeTracker:
    """Track SQL learning sessions and progress"""

    def __init__(self):
        self.base_dir = Path(__file__).parent
        self.learning_dir = self.base_dir / "learning" / "sql"
        self.data_dir = self.learning_dir / ".progress"
        self.data_dir.mkdir(parents=True, exist_ok=True)

        self.sessions_file = self.data_dir / "sessions.json"
        self.progress_file = self.data_dir / "progress.json"
        self.current_session_file = Path.home() / ".current_sql_session"

        self.load_data()

    def load_data(self):
        """Load session history and progress with backup on corruption"""
        # Load sessions
        if self.sessions_file.exists():
            try:
                with open(self.sessions_file, 'r') as f:
                    self.sessions = json.load(f)
            except json.JSONDecodeError:
                print(f"{Colors.YELLOW}⚠️  Warning: Corrupted sessions file{Colors.ENDC}")
                # Try to backup corrupted file
                backup_file = self.sessions_file.with_suffix('.json.backup')
                try:
                    self.sessions_file.rename(backup_file)
                    print(f"Backed up to: {backup_file}")
                except OSError:
                    pass
                self.sessions = []
        else:
            self.sessions = []

        # Load progress
        if self.progress_file.exists():
            try:
                with open(self.progress_file, 'r') as f:
                    self.progress = json.load(f)
            except json.JSONDecodeError:
                print(f"{Colors.YELLOW}⚠️  Warning: Corrupted progress file{Colors.ENDC}")
                # Try to backup corrupted file
                backup_file = self.progress_file.with_suffix('.json.backup')
                try:
                    self.progress_file.rename(backup_file)
                    print(f"Backed up to: {backup_file}")
                except OSError:
                    pass
                self.progress = self._default_progress()
        else:
            self.progress = self._default_progress()

    def _default_progress(self) -> Dict:
        """Get default progress structure"""
        return {
            "current_week": "Week 1",
            "completed_exercises": [],
            "completed_topics": [],
            "total_sessions": 0,
            "total_minutes": 0
        }

    def save_data(self):
        """Save session history and progress with atomic writes"""
        # Atomic write for sessions
        temp_sessions = self.sessions_file.with_suffix('.json.tmp')
        try:
            with open(temp_sessions, 'w') as f:
                json.dump(self.sessions, f, indent=2)
            # Atomic rename
            temp_sessions.replace(self.sessions_file)
        except (OSError, IOError) as e:
            print(f"{Colors.RED}❌ Error saving sessions: {e}{Colors.ENDC}")
            if temp_sessions.exists():
                temp_sessions.unlink()

        # Atomic write for progress
        temp_progress = self.progress_file.with_suffix('.json.tmp')
        try:
            with open(temp_progress, 'w') as f:
                json.dump(self.progress, f, indent=2)
            # Atomic rename
            temp_progress.replace(self.progress_file)
        except (OSError, IOError) as e:
            print(f"{Colors.RED}❌ Error saving progress: {e}{Colors.ENDC}")
            if temp_progress.exists():
                temp_progress.unlink()

    def start_session(self, topic: str):
        """Start a new learning session

        Args:
            topic: Topic or exercise being studied

        Checks for existing active sessions and warns if found.
        """
        if self.current_session_file.exists():
            try:
                with open(self.current_session_file, 'r') as f:
                    data = json.load(f)
                started = datetime.fromisoformat(data['start_time'])
                elapsed = (datetime.now() - started).total_seconds() / 60

                print(f"{Colors.YELLOW}⚠️  Warning: There's already an active session!{Colors.ENDC}")
                print(f"Started at: {started.strftime('%I:%M %p')}")
                print(f"Topic: {data['topic']}")
                print(f"Elapsed: {elapsed:.0f} minutes")
                print(f"\nUse 'python sql_practice.py end' to close it first.")
                return
            except (json.JSONDecodeError, KeyError, ValueError):
                print(f"{Colors.YELLOW}⚠️  Removing corrupted session file{Colors.ENDC}")
                self.current_session_file.unlink()

        start_time = datetime.now()
        session_data = {
            'start_time': start_time.isoformat(),
            'topic': topic,
            'week': self.progress['current_week']
        }

        with open(self.current_session_file, 'w') as f:
            json.dump(session_data, f, indent=2)

        print(f"\n{Colors.GREEN}✅ SQL Learning Session Started{Colors.ENDC}")
        print(f"{Colors.CYAN}Topic:{Colors.ENDC} {topic}")
        print(f"{Colors.CYAN}Week:{Colors.ENDC} {self.progress['current_week']}")
        print(f"{Colors.CYAN}Started:{Colors.ENDC} {start_time.strftime('%I:%M %p')}")
        print(f"\n{Colors.YELLOW}⏰ Remember: 30-minute focused session{Colors.ENDC}")
        print(f"Set a timer and take notes as you learn!\n")

    def end_session(self, notes: str = ""):
        """End the current learning session

        Args:
            notes: Session notes and accomplishments

        Records session data and updates progress tracking.
        """
        if not self.current_session_file.exists():
            print(f"{Colors.RED}❌ No active session found.{Colors.ENDC}")
            print("Start a session with: python sql_practice.py start \"<topic>\"")
            return

        try:
            with open(self.current_session_file, 'r') as f:
                session_data = json.load(f)

            start_time = datetime.fromisoformat(session_data['start_time'])
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            print(f"{Colors.RED}❌ Error: Corrupted session file{Colors.ENDC}")
            print(f"   {e}")
            print("\nRemoving corrupted session file")
            self.current_session_file.unlink()
            return

        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds() / 60  # minutes

        # Warn if session too long
        if duration > 35:
            print(f"\n{Colors.YELLOW}⚠️  Session longer than 30 minutes ({duration:.1f} min)!{Colors.ENDC}")
            print("Consider taking a break before the next session.\n")
        elif duration < 25:
            print(f"\n{Colors.YELLOW}⚠️  Short session ({duration:.1f} min).{Colors.ENDC}")
            print("Aim for full 30-minute focused sessions.\n")

        # Record session
        session_record = {
            'date': start_time.strftime('%Y-%m-%d'),
            'start_time': start_time.strftime('%I:%M %p'),
            'end_time': end_time.strftime('%I:%M %p'),
            'duration_minutes': round(duration, 1),
            'topic': session_data['topic'],
            'week': session_data['week'],
            'notes': notes
        }

        self.sessions.append(session_record)

        # Update progress
        self.progress['total_sessions'] += 1
        self.progress['total_minutes'] += round(duration, 1)

        self.save_data()
        self.current_session_file.unlink()

        print(f"{Colors.GREEN}✅ Session Complete!{Colors.ENDC}")
        print(f"{Colors.CYAN}Duration:{Colors.ENDC} {duration:.1f} minutes")
        print(f"{Colors.CYAN}Topic:{Colors.ENDC} {session_data['topic']}")
        if notes:
            print(f"{Colors.CYAN}Notes:{Colors.ENDC} {notes}")

        # Show progress for current week
        self._show_week_progress(session_data['week'])

    def _show_week_progress(self, week: str):
        """Show progress for a specific week"""
        if week not in LEARNING_PHASES:
            return

        phase_info = LEARNING_PHASES[week]
        target = phase_info['sessions_target']

        # Count sessions for this week
        completed = sum(1 for s in self.sessions if s['week'] == week)
        minutes = sum(s['duration_minutes'] for s in self.sessions if s['week'] == week)

        percentage = (completed / target) * 100 if target > 0 else 0

        print(f"\n{Colors.BOLD}Progress for {week}:{Colors.ENDC}")
        print(f"{phase_info['phase']}")
        print(f"Sessions: {completed}/{target} ({percentage:.1f}%)")
        print(f"Time: {minutes:.1f} minutes ({minutes/60:.1f} hours)")

        if percentage >= 100:
            print(f"{Colors.GREEN}🎉 Week complete! Consider moving to next week.{Colors.ENDC}")
            print(f"Use: python sql_practice.py next-week")

    def show_progress(self):
        """Display overall learning progress"""
        print(f"\n{Colors.BOLD}{Colors.HEADER}=== SQL Learning Progress ==={Colors.ENDC}\n")
        print(f"{Colors.CYAN}Current Week:{Colors.ENDC} {self.progress['current_week']}")
        print(f"{Colors.CYAN}Total Sessions:{Colors.ENDC} {self.progress['total_sessions']}")
        print(f"{Colors.CYAN}Total Time:{Colors.ENDC} {self.progress['total_minutes']:.1f} min ({self.progress['total_minutes']/60:.1f} hours)")
        print(f"{Colors.CYAN}Exercises Completed:{Colors.ENDC} {len(self.progress['completed_exercises'])}/50")

        print(f"\n{Colors.BOLD}Progress by Week:{Colors.ENDC}\n")

        for week, phase_info in LEARNING_PHASES.items():
            target = phase_info['sessions_target']
            completed = sum(1 for s in self.sessions if s['week'] == week)
            minutes = sum(s['duration_minutes'] for s in self.sessions if s['week'] == week)
            percentage = (completed / target) * 100 if target > 0 else 0

            # Color code based on progress
            if percentage >= 100:
                color = Colors.GREEN
                status = "✅"
            elif percentage > 0:
                color = Colors.YELLOW
                status = "🔄"
            else:
                color = Colors.ENDC
                status = "⏳"

            print(f"{status} {color}{week}: {phase_info['phase']}{Colors.ENDC}")
            print(f"   Sessions: {completed}/{target} ({percentage:.1f}%)")
            print(f"   Time: {minutes:.1f} min ({minutes/60:.1f} hours)")

            if percentage > 0 and percentage < 100:
                remaining = target - completed
                print(f"   Remaining: {remaining} sessions ({remaining * 30} min)")
            print()

    def show_summary(self):
        """Show weekly summary for Friday review"""
        today = datetime.now()
        week_ago = today - timedelta(days=7)

        week_sessions = [s for s in self.sessions
                        if datetime.strptime(s['date'], '%Y-%m-%d') >= week_ago]

        if not week_sessions:
            print(f"\n{Colors.YELLOW}No sessions recorded in the past week.{Colors.ENDC}\n")
            return

        total_minutes = sum(s['duration_minutes'] for s in week_sessions)
        total_sessions = len(week_sessions)

        print(f"\n{Colors.BOLD}{Colors.HEADER}=== This Week's Learning ==={Colors.ENDC}\n")
        print(f"{Colors.CYAN}Sessions:{Colors.ENDC} {total_sessions}")
        print(f"{Colors.CYAN}Total Time:{Colors.ENDC} {total_minutes:.1f} min ({total_minutes/60:.1f} hours)")
        print(f"{Colors.CYAN}Average Session:{Colors.ENDC} {total_minutes/total_sessions:.1f} min")

        # Group by topic
        topics = {}
        for session in week_sessions:
            topic = session['topic']
            if topic not in topics:
                topics[topic] = {'count': 0, 'time': 0}
            topics[topic]['count'] += 1
            topics[topic]['time'] += session['duration_minutes']

        print(f"\n{Colors.BOLD}Topics Covered:{Colors.ENDC}")
        for topic, data in topics.items():
            print(f"  • {topic}")
            print(f"    {data['count']} session(s), {data['time']:.1f} min")

        # Recent session notes
        recent_with_notes = [s for s in week_sessions[-5:] if s['notes']]
        if recent_with_notes:
            print(f"\n{Colors.BOLD}Recent Notes:{Colors.ENDC}")
            for session in recent_with_notes:
                print(f"  • {session['date']}: {session['notes']}")

        print()

    def show_stats(self):
        """Show overall statistics"""
        if not self.sessions:
            print(f"\n{Colors.YELLOW}No sessions recorded yet.{Colors.ENDC}\n")
            return

        total_sessions = len(self.sessions)
        total_minutes = sum(s['duration_minutes'] for s in self.sessions)
        avg_duration = total_minutes / total_sessions

        # Count sessions by day of week
        days = {}
        for session in self.sessions:
            date = datetime.strptime(session['date'], '%Y-%m-%d')
            day = date.strftime('%A')
            days[day] = days.get(day, 0) + 1

        # Best day
        best_day = max(days.items(), key=lambda x: x[1]) if days else ("None", 0)

        # Longest streak
        dates = sorted(set(s['date'] for s in self.sessions))
        current_streak = 0
        max_streak = 0
        prev_date = None

        for date_str in dates:
            date = datetime.strptime(date_str, '%Y-%m-%d')
            if prev_date:
                diff = (date - prev_date).days
                if diff == 1:
                    current_streak += 1
                else:
                    max_streak = max(max_streak, current_streak)
                    current_streak = 1
            else:
                current_streak = 1
            prev_date = date
        max_streak = max(max_streak, current_streak)

        print(f"\n{Colors.BOLD}{Colors.HEADER}=== Learning Statistics ==={Colors.ENDC}\n")
        print(f"{Colors.CYAN}Total Sessions:{Colors.ENDC} {total_sessions}")
        print(f"{Colors.CYAN}Total Time:{Colors.ENDC} {total_minutes:.1f} min ({total_minutes/60:.1f} hours)")
        print(f"{Colors.CYAN}Average Session:{Colors.ENDC} {avg_duration:.1f} min")
        print(f"{Colors.CYAN}Best Day:{Colors.ENDC} {best_day[0]} ({best_day[1]} sessions)")
        print(f"{Colors.CYAN}Longest Streak:{Colors.ENDC} {max_streak} days")
        print(f"{Colors.CYAN}Exercises Done:{Colors.ENDC} {len(self.progress['completed_exercises'])}/50")

        # Days with sessions
        print(f"\n{Colors.BOLD}Sessions by Day of Week:{Colors.ENDC}")
        day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        for day in day_order:
            count = days.get(day, 0)
            bar = "█" * count
            print(f"  {day:9s}: {bar} {count}")

        print()

    def mark_exercise_complete(self, exercise_num: int):
        """Mark an exercise as completed"""
        if exercise_num in self.progress['completed_exercises']:
            print(f"{Colors.YELLOW}Exercise {exercise_num} already marked complete.{Colors.ENDC}")
            return

        self.progress['completed_exercises'].append(exercise_num)
        self.progress['completed_exercises'].sort()
        self.save_data()

        print(f"{Colors.GREEN}✅ Exercise {exercise_num} marked complete!{Colors.ENDC}")
        print(f"Total exercises: {len(self.progress['completed_exercises'])}/50")

    def next_week(self):
        """Move to next week in learning roadmap"""
        week_order = ["Week 1", "Week 2", "Week 3-4", "Week 5-8"]
        current_idx = week_order.index(self.progress['current_week'])

        if current_idx >= len(week_order) - 1:
            print(f"{Colors.GREEN}🎉 Congratulations! You've completed the entire roadmap!{Colors.ENDC}")
            return

        next_week = week_order[current_idx + 1]
        self.progress['current_week'] = next_week
        self.save_data()

        print(f"\n{Colors.GREEN}✅ Moving to {next_week}{Colors.ENDC}")
        print(f"{Colors.CYAN}Phase:{Colors.ENDC} {LEARNING_PHASES[next_week]['phase']}")
        print(f"{Colors.CYAN}Target:{Colors.ENDC} {LEARNING_PHASES[next_week]['sessions_target']} sessions")
        print(f"\n{Colors.BOLD}Topics:{Colors.ENDC}")
        for topic in LEARNING_PHASES[next_week]['topics']:
            print(f"  • {topic}")
        print()

def print_usage():
    """Print usage information"""
    print(f"""
{Colors.BOLD}{Colors.HEADER}SQL Practice Session Tracker{Colors.ENDC}

{Colors.BOLD}Usage:{Colors.ENDC}
    python sql_practice.py start "<topic>"         Start learning session
    python sql_practice.py end ["notes"]           End session, update progress
    python sql_practice.py progress                View progress through roadmap
    python sql_practice.py summary                 Weekly summary (for Friday review)
    python sql_practice.py stats                   Overall statistics
    python sql_practice.py exercise <num>          Mark exercise complete
    python sql_practice.py next-week               Move to next week

{Colors.BOLD}Examples:{Colors.ENDC}
    python sql_practice.py start "Phase 1: SELECT statements"
    python sql_practice.py end "Completed exercises 1-5, practiced WHERE clauses"
    python sql_practice.py exercise 15
    python sql_practice.py progress

{Colors.BOLD}Integration:{Colors.ENDC}
    • Follows Corey Dev Framework (30-minute sessions)
    • Tracks progress through 8-week SQL roadmap
    • Integrates with Friday review ritual
    • Monitors sustainable pace (5-7.5 hours/week)
""")

def main():
    if len(sys.argv) < 2:
        print_usage()
        return

    tracker = SQLPracticeTracker()
    command = sys.argv[1].lower()

    if command == "start":
        if len(sys.argv) < 3:
            print(f"{Colors.RED}Error: Topic required{Colors.ENDC}")
            print("Usage: python sql_practice.py start \"<topic>\"")
            return
        topic = " ".join(sys.argv[2:])
        tracker.start_session(topic)

    elif command == "end":
        notes = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else ""
        tracker.end_session(notes)

    elif command == "progress":
        tracker.show_progress()

    elif command == "summary":
        tracker.show_summary()

    elif command == "stats":
        tracker.show_stats()

    elif command == "exercise":
        if len(sys.argv) < 3:
            print(f"{Colors.RED}Error: Exercise number required{Colors.ENDC}")
            print("Usage: python sql_practice.py exercise <num>")
            return
        try:
            exercise_num = int(sys.argv[2])
            tracker.mark_exercise_complete(exercise_num)
        except ValueError:
            print(f"{Colors.RED}Error: Invalid exercise number{Colors.ENDC}")

    elif command == "next-week":
        tracker.next_week()

    else:
        print(f"{Colors.RED}Unknown command: {command}{Colors.ENDC}")
        print_usage()

if __name__ == "__main__":
    main()
