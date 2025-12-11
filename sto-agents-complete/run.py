#!/usr/bin/env python3
"""
STO Agents - Main Orchestrator
Sales Team One PDX | Builder's FirstSource

Coordinates all automation agents for Richmond American, Holt Homes, 
Manor Homes, and Sekisui House operations.
"""

import argparse
import json
import logging
import sys
from datetime import datetime
from pathlib import Path

# Configure logging
LOG_DIR = Path(__file__).parent / "data" / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(name)s | %(levelname)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_DIR / f"sto_agents_{datetime.now().strftime('%Y-%m-%d')}.log")
    ]
)
logger = logging.getLogger('orchestrator')

# ASCII Banner
BANNER = """
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║   ███████╗████████╗ ██████╗      █████╗  ██████╗ ███████╗███╗   ██╗  ║
║   ██╔════╝╚══██╔══╝██╔═══██╗    ██╔══██╗██╔════╝ ██╔════╝████╗  ██║  ║
║   ███████╗   ██║   ██║   ██║    ███████║██║  ███╗█████╗  ██╔██╗ ██║  ║
║   ╚════██║   ██║   ██║   ██║    ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║  ║
║   ███████║   ██║   ╚██████╔╝    ██║  ██║╚██████╔╝███████╗██║ ╚████║  ║
║   ╚══════╝   ╚═╝    ╚═════╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝  ║
║                                                                       ║
║              Sales Team One PDX | Builder's FirstSource               ║
║                     Richmond, Holt & Manor Operations                 ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
"""

def print_banner():
    """Print the STO Agents banner"""
    print(BANNER)

def import_agents():
    """Import all agent modules with error handling"""
    agents = {}
    
    try:
        from agents.plan_intake import run_plan_intake
        agents['plan_intake'] = run_plan_intake
    except ImportError as e:
        logger.warning(f"Could not import plan_intake: {e}")
        agents['plan_intake'] = None
    
    try:
        from agents.completeness_checker import run_completeness_check
        agents['completeness'] = run_completeness_check
    except ImportError as e:
        logger.warning(f"Could not import completeness_checker: {e}")
        agents['completeness'] = None
    
    try:
        from agents.pdss_sync import run_pdss_sync
        agents['pdss_sync'] = run_pdss_sync
    except ImportError as e:
        logger.warning(f"Could not import pdss_sync: {e}")
        agents['pdss_sync'] = None
    
    try:
        from agents.backup_agent import run_backup
        agents['backup'] = run_backup
    except ImportError as e:
        logger.warning(f"Could not import backup_agent: {e}")
        agents['backup'] = None
    
    try:
        from agents.supplypro_reporter import run_supplypro_report
        agents['supplypro'] = run_supplypro_report
    except ImportError as e:
        logger.warning(f"Could not import supplypro_reporter: {e}")
        agents['supplypro'] = None
    
    return agents

def run_morning_routine(agents: dict) -> dict:
    """
    Morning routine - run at start of day
    1. Check portals for new plans
    2. Run completeness check on active jobs
    3. Sync PDSS tracker
    4. Generate SupplyPro report
    """
    print_banner()
    logger.info("Starting morning routine")
    
    results = {
        "start_time": datetime.now().isoformat(),
        "plan_intake": {},
        "completeness": {},
        "pdss_sync": {},
        "supplypro": {},
        "errors": []
    }
    
    # Step 1: Check portals for new plans
    logger.info("Step 1: Checking portals for new plans...")
    if agents.get('plan_intake'):
        try:
            results['plan_intake'] = agents['plan_intake']()
        except Exception as e:
            logger.error(f"Plan intake failed: {e}")
            results['errors'].append(f"plan_intake: {str(e)}")
    
    # Step 2: Run completeness check
    logger.info("Step 2: Running completeness check...")
    if agents.get('completeness'):
        try:
            results['completeness'] = agents['completeness']()
        except Exception as e:
            logger.error(f"Completeness check failed: {e}")
            results['errors'].append(f"completeness: {str(e)}")
    
    # Step 3: Sync PDSS
    logger.info("Step 3: Syncing PDSS...")
    if agents.get('pdss_sync'):
        try:
            results['pdss_sync'] = agents['pdss_sync']()
        except Exception as e:
            logger.error(f"PDSS sync failed: {e}")
            results['errors'].append(f"pdss_sync: {str(e)}")
    
    # Step 4: SupplyPro Report
    logger.info("Step 4: Generating SupplyPro report...")
    if agents.get('supplypro'):
        try:
            results['supplypro'] = agents['supplypro'](send_teams=True, save_report=True)
        except Exception as e:
            logger.error(f"SupplyPro report failed: {e}")
            results['errors'].append(f"supplypro: {str(e)}")
    
    results['end_time'] = datetime.now().isoformat()
    duration = (datetime.fromisoformat(results['end_time']) - 
                datetime.fromisoformat(results['start_time'])).seconds
    results['duration_seconds'] = duration
    
    logger.info(f"Morning routine complete in {duration} seconds")
    
    return results

def run_evening_routine(agents: dict) -> dict:
    """
    Evening routine - run at end of day
    1. Final PDSS sync
    2. Nightly backup
    """
    print_banner()
    logger.info("Starting evening routine")
    
    results = {
        "start_time": datetime.now().isoformat(),
        "pdss_sync": {},
        "backup": {},
        "errors": []
    }
    
    # Step 1: Final PDSS sync
    logger.info("Step 1: Final PDSS sync...")
    if agents.get('pdss_sync'):
        try:
            results['pdss_sync'] = agents['pdss_sync']()
        except Exception as e:
            logger.error(f"PDSS sync failed: {e}")
            results['errors'].append(f"pdss_sync: {str(e)}")
    
    # Step 2: Nightly backup
    logger.info("Step 2: Running nightly backup...")
    if agents.get('backup'):
        try:
            results['backup'] = agents['backup'](backup_type='nightly')
        except Exception as e:
            logger.error(f"Backup failed: {e}")
            results['errors'].append(f"backup: {str(e)}")
    
    results['end_time'] = datetime.now().isoformat()
    duration = (datetime.fromisoformat(results['end_time']) - 
                datetime.fromisoformat(results['start_time'])).seconds
    results['duration_seconds'] = duration
    
    logger.info(f"Evening routine complete in {duration} seconds")
    
    return results

def run_single_agent(agents: dict, agent_name: str, **kwargs) -> dict:
    """Run a single agent by name"""
    print_banner()
    
    if agent_name not in agents or agents[agent_name] is None:
        logger.error(f"Agent '{agent_name}' not available")
        return {"error": f"Agent '{agent_name}' not found or failed to load"}
    
    logger.info(f"Running agent: {agent_name}")
    
    try:
        result = agents[agent_name](**kwargs)
        return result
    except Exception as e:
        logger.error(f"Agent {agent_name} failed: {e}")
        return {"error": str(e)}

def main():
    parser = argparse.ArgumentParser(
        description="STO Agents - Sales Team One Automation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run.py --morning              Run morning routine
  python run.py --evening              Run evening routine
  python run.py --agent plan_intake    Run plan intake monitor
  python run.py --agent completeness   Run completeness checker
  python run.py --agent pdss_sync      Run PDSS sync
  python run.py --agent backup         Run backup agent
  python run.py --agent supplypro      Run SupplyPro reporter
        """
    )
    
    # Routine options
    parser.add_argument('--morning', action='store_true',
                        help='Run morning routine (portal check + completeness + PDSS + SupplyPro)')
    parser.add_argument('--evening', action='store_true',
                        help='Run evening routine (PDSS sync + nightly backup)')
    
    # Individual agent options
    parser.add_argument('--agent', type=str,
                        choices=['plan_intake', 'completeness', 'pdss_sync', 'backup', 'supplypro'],
                        help='Run a specific agent')
    
    # Agent-specific options
    parser.add_argument('--builder', type=str,
                        choices=['richmond_american', 'holt_homes', 'manor_homes', 'sekisui_house'],
                        help='Builder for completeness check')
    parser.add_argument('--type', type=str,
                        choices=['nightly', 'weekly', 'monthly'],
                        default='nightly',
                        help='Backup type')
    parser.add_argument('--no-teams', action='store_true',
                        help='Skip Teams notification')
    
    args = parser.parse_args()
    
    # Import agents
    agents = import_agents()
    
    # Determine what to run
    if args.morning:
        results = run_morning_routine(agents)
    elif args.evening:
        results = run_evening_routine(agents)
    elif args.agent:
        kwargs = {}
        if args.agent == 'completeness' and args.builder:
            kwargs['builder_key'] = args.builder
        elif args.agent == 'backup':
            kwargs['backup_type'] = args.type
        elif args.agent == 'supplypro':
            kwargs['send_teams'] = not args.no_teams
            kwargs['save_report'] = True
        results = run_single_agent(agents, args.agent, **kwargs)
    else:
        parser.print_help()
        return
    
    # Output results
    print("\n" + "=" * 60)
    print("RESULTS")
    print("=" * 60)
    print(json.dumps(results, indent=2, default=str))

if __name__ == "__main__":
    main()
