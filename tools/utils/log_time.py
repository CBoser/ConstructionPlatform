#!/usr/bin/env python3
"""
Time Tracking Helper - Log development sessions following Corey Dev Framework
Helps track 30-minute sessions and daily progress

Version: 1.1.0
"""

import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

__version__ = "1.1.0"

def log_session_start(sprint_dir: Path = None) -> datetime:
    """Log the start of a development session

    Args:
        sprint_dir: Sprint directory (auto-detected if None)

    Returns:
        Session start time

    Raises:
        SystemExit: If sprint directory cannot be found or session already active
    """
    # Check for existing session first
    session_file = Path.home() / ".current_session"
    if session_file.exists():
        try:
            session_data = session_file.read_text().strip().split('|')
            if len(session_data) >= 1:
                start_time = datetime.fromisoformat(session_data[0])
                elapsed = (datetime.now() - start_time).total_seconds() / 60
                print(f"⚠️  Warning: A session is already active!")
                print(f"   Started: {start_time.strftime('%H:%M')}")
                print(f"   Elapsed: {elapsed:.0f} minutes")
                print(f"\n   End it first: python log_time.py end")
                sys.exit(1)
        except (ValueError, IndexError):
            # Corrupted session file, remove it
            print("⚠️  Removing corrupted session file")
            session_file.unlink()

    if sprint_dir is None:
        sprint_dir = find_current_sprint()

    if not sprint_dir:
        print("❌ Error: Could not find current sprint directory")
        print("Run from project root or specify sprint directory")
        print("\nAlternatively, create a sprint first:")
        print("  python create_sprint.py <sprint_number>")
        sys.exit(1)

    progress_file = sprint_dir / "PROGRESS.md"

    if not progress_file.exists():
        print(f"❌ Error: {progress_file} not found")
        print(f"Sprint directory exists but missing PROGRESS.md")
        print(f"\nCreate it with: python create_sprint.py <sprint_number>")
        sys.exit(1)

    start_time = datetime.now()

    print(f"⏱️  Session started at {start_time.strftime('%H:%M')}")
    print(f"📁 Sprint: {sprint_dir.name}")
    print(f"\n✅ Logged to {progress_file}")
    print(f"\n💡 Tips:")
    print(f"   - Work for 30 minutes max")
    print(f"   - Use timer to stay focused")
    print(f"   - One task only")
    print(f"   - When done, run: python log_time.py end")

    # Store start time for this session
    try:
        session_file.write_text(f"{start_time.isoformat()}|{sprint_dir}")
    except (PermissionError, OSError) as e:
        print(f"\n⚠️  Warning: Could not save session file: {e}")
        print("Session tracking may not work correctly")

    return start_time

def log_session_end(sprint_dir: Path = None, notes: str = None):
    """Log the end of a development session

    Args:
        sprint_dir: Sprint directory (read from session file if None)
        notes: Session notes (prompted if None)

    Raises:
        SystemExit: If no active session found
    """
    session_file = Path.home() / ".current_session"

    if not session_file.exists():
        print("❌ Error: No active session found")
        print("Start a session first: python log_time.py start")
        sys.exit(1)

    # Read session data with error handling
    try:
        session_data = session_file.read_text().strip().split('|')
        if len(session_data) < 2:
            raise ValueError("Invalid session data format")
        start_time = datetime.fromisoformat(session_data[0])
        session_sprint_dir = Path(session_data[1])
    except (ValueError, IndexError) as e:
        print(f"❌ Error: Corrupted session file")
        print(f"   {e}")
        print("\nRemoving corrupted session file")
        session_file.unlink()
        sys.exit(1)

    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds() / 60  # minutes

    print(f"⏱️  Session ended at {end_time.strftime('%H:%M')}")
    print(f"⌚ Duration: {duration:.0f} minutes ({duration/60:.1f} hours)")

    if duration > 35:
        print(f"\n⚠️  Warning: Session longer than 30 minutes!")
        print(f"   Consider taking a break for sustainability")

    # Prompt for what was done
    if not notes:
        print(f"\n📝 What did you accomplish?")
        notes = input("> ")

    # Log to progress file
    progress_file = session_sprint_dir / "PROGRESS.md"

    if progress_file.exists():
        try:
            with open(progress_file, 'a') as f:
                f.write(f"\n\n### Session - {end_time.strftime('%Y-%m-%d %H:%M')}\n")
                f.write(f"**Duration**: {duration:.0f} minutes\n")
                f.write(f"**Work Done**: {notes}\n")

            print(f"\n✅ Logged to {progress_file}")
        except (PermissionError, OSError) as e:
            print(f"\n⚠️  Warning: Could not update progress file: {e}")
            print(f"Session data:")
            print(f"  Duration: {duration:.0f} minutes")
            print(f"  Notes: {notes}")
    else:
        print(f"\n⚠️  Warning: Progress file not found: {progress_file}")
        print(f"Session completed but not logged")

    # Clean up session file
    try:
        session_file.unlink()
    except OSError as e:
        print(f"\n⚠️  Warning: Could not remove session file: {e}")

    # Reminder for next steps
    print(f"\n💡 Next steps:")
    print(f"   - Take a 5-minute break")
    print(f"   - Commit your changes")
    print(f"   - Update PROGRESS.md if needed")

    if duration < 60:
        print(f"   - Ready for another session if you have energy")

def log_daily_summary():
    """Create end-of-day summary"""
    print(f"\n📊 Daily Summary")
    print(f"=" * 50)

    date = datetime.now().strftime('%Y-%m-%d')
    print(f"\nDate: {date}")

    # Prompt for summary
    print(f"\n1. What tasks did you complete today?")
    completed = input("> ")

    print(f"\n2. Any blockers encountered?")
    blockers = input("> ")

    print(f"\n3. What's next for tomorrow?")
    next_steps = input("> ")

    print(f"\n4. Total hours today?")
    hours = input("> ")

    summary = f"""
## Daily Summary - {date}

**Total Hours**: {hours} hours

**Completed**:
{completed}

**Blockers**:
{blockers}

**Next Session**:
{next_steps}
"""

    print(f"\n✅ Summary created:")
    print(summary)

    print(f"\n💾 Add this to your PROGRESS.md file")

def find_current_sprint() -> Optional[Path]:
    """Try to find the current sprint directory

    Returns:
        Path to current sprint directory, or None if not found

    Search order:
        1. Current directory (if named sprint-XX)
        2. Parent directory (if named sprint-XX)
        3. Latest sprint in docs/sprints/
    """
    cwd = Path.cwd()

    # Check if we're in a sprint directory
    if cwd.name.startswith('sprint-'):
        return cwd

    # Check if parent is a sprint directory
    if cwd.parent.name.startswith('sprint-'):
        return cwd.parent

    # Check if docs/sprints exists
    sprints_dir = cwd / "docs" / "sprints"
    if sprints_dir.exists() and sprints_dir.is_dir():
        try:
            # Find the highest numbered sprint
            sprint_dirs = sorted([
                d for d in sprints_dir.iterdir()
                if d.is_dir() and d.name.startswith('sprint-')
            ])
            if sprint_dirs:
                return sprint_dirs[-1]
        except PermissionError:
            pass

    return None

def show_velocity():
    """Calculate and show velocity metrics"""
    sprint_dir = find_current_sprint()

    if not sprint_dir:
        print("Error: Not in a sprint directory")
        sys.exit(1)

    progress_file = sprint_dir / "PROGRESS.md"

    if not progress_file.exists():
        print(f"Error: {progress_file} not found")
        sys.exit(1)

    # Simple parsing to count sessions
    content = progress_file.read_text()
    session_count = content.count('### Session -')

    print(f"\n📊 Velocity Metrics - {sprint_dir.name}")
    print(f"=" * 50)
    print(f"Sessions logged: {session_count}")
    print(f"Estimated hours: {session_count * 0.5:.1f} hours")

    # Check for PLAN.md to see task completion
    plan_file = sprint_dir / "PLAN.md"
    if plan_file.exists():
        plan_content = plan_file.read_text()
        total_tasks = plan_content.count('- [ ]')
        completed_tasks = plan_content.count('- [x]') + plan_content.count('- [X]')

        if total_tasks > 0:
            completion_rate = (completed_tasks / total_tasks) * 100
            print(f"\nTasks completed: {completed_tasks} / {total_tasks} ({completion_rate:.0f}%)")

            if completion_rate < 70:
                print(f"\n⚠️  Below 70% completion rate")
                print(f"   Consider reducing scope for next sprint")
            elif completion_rate > 90:
                print(f"\n✅ Excellent completion rate!")
                print(f"   Can consider slightly more tasks next sprint")

def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Time Tracking Helper - Corey Dev Framework")
        print(f"Version: {__version__}")
        print("\nUsage:")
        print("  python log_time.py start         # Start a new session")
        print("  python log_time.py end           # End current session")
        print("  python log_time.py end 'notes'   # End with specific notes")
        print("  python log_time.py summary       # Create daily summary")
        print("  python log_time.py velocity      # Show velocity metrics")
        print("\nOptions:")
        print("  --version    Show version information")
        print("  --help       Show this help message")
        print("\nExamples:")
        print("  python log_time.py start")
        print("  python log_time.py end 'Fixed customer validation bug'")
        print("  python log_time.py summary")
        sys.exit(1)

    # Handle version/help flags
    if sys.argv[1] in ['--version', '-v']:
        print(f"log_time.py version {__version__}")
        sys.exit(0)

    if sys.argv[1] in ['--help', '-h']:
        main()  # Show usage

    command = sys.argv[1].lower()

    if command == 'start':
        log_session_start()

    elif command == 'end':
        notes = sys.argv[2] if len(sys.argv) > 2 else None
        log_session_end(notes=notes)

    elif command == 'summary':
        log_daily_summary()

    elif command == 'velocity':
        show_velocity()

    else:
        print(f"Error: Unknown command '{command}'")
        print("Valid commands: start, end, summary, velocity")
        sys.exit(1)

if __name__ == "__main__":
    main()
