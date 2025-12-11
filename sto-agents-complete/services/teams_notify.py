"""
Teams Notification Service
Sends notifications to Microsoft Teams via webhooks.

Setup:
1. Create an Incoming Webhook in your Teams channel
2. Set TEAMS_WEBHOOK_URL environment variable
   OR update config/settings.py with the webhook URL
"""

import logging
import json
import os
from datetime import datetime
from typing import Optional
import urllib.request
import urllib.error

# Setup logging
logger = logging.getLogger('teams_notify')

# Import settings
try:
    from config.settings import TEAMS_WEBHOOK_URL, TEAMS_WEBHOOKS
except ImportError:
    TEAMS_WEBHOOK_URL = os.environ.get("TEAMS_WEBHOOK_URL", "")
    TEAMS_WEBHOOKS = {}

# =============================================================================
# WEBHOOK CONFIGURATION
# =============================================================================

def get_webhook_url(channel: str = "general") -> str:
    """Get webhook URL for a specific channel"""
    # Check channel-specific webhooks first
    if TEAMS_WEBHOOKS and channel in TEAMS_WEBHOOKS:
        url = TEAMS_WEBHOOKS[channel]
        if url:
            return url
    
    # Fall back to default webhook
    if TEAMS_WEBHOOK_URL:
        return TEAMS_WEBHOOK_URL
    
    # Check environment variable
    return os.environ.get("TEAMS_WEBHOOK_URL", "")

# =============================================================================
# MESSAGE FORMATTING
# =============================================================================

def format_adaptive_card(title: str, message: str, color: str = "0076D7") -> dict:
    """
    Format message as Teams Adaptive Card.
    
    Args:
        title: Card title
        message: Main message content (supports markdown)
        color: Accent color (hex without #)
    """
    return {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": color,
        "summary": title,
        "sections": [{
            "activityTitle": title,
            "activitySubtitle": datetime.now().strftime("%B %d, %Y %I:%M %p"),
            "text": message,
            "markdown": True
        }]
    }

def format_simple_message(message: str) -> dict:
    """Format a simple text message"""
    return {
        "text": message
    }

# =============================================================================
# SEND FUNCTIONS
# =============================================================================

def send_teams_message(payload: dict, channel: str = "general") -> bool:
    """
    Send a message payload to Teams.
    
    Args:
        payload: Message payload (dict)
        channel: Target channel (general, alerts, automation)
    
    Returns:
        True if successful, False otherwise
    """
    webhook_url = get_webhook_url(channel)
    
    if not webhook_url:
        logger.warning("Teams webhook URL not configured - skipping notification")
        return False
    
    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            webhook_url,
            data=data,
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                logger.info(f"Teams notification sent to {channel}")
                return True
            else:
                logger.error(f"Teams webhook returned status {response.status}")
                return False
                
    except urllib.error.URLError as e:
        logger.error(f"Failed to send Teams notification: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error sending Teams notification: {e}")
        return False

def send_teams_notification(title: str, message: str, channel: str = "general", 
                           color: str = "0076D7") -> bool:
    """
    Send a formatted notification to Teams.
    
    Args:
        title: Notification title
        message: Message content (supports basic markdown)
        channel: Target channel
        color: Accent color (hex without #)
            - 0076D7: Blue (default/info)
            - 00FF00: Green (success)
            - FFA500: Orange (warning)
            - FF0000: Red (error)
    """
    payload = format_adaptive_card(title, message, color)
    return send_teams_message(payload, channel)

# =============================================================================
# SPECIFIC NOTIFICATION TYPES
# =============================================================================

def notify_plan_intake(plans_downloaded: list, errors: list = None) -> bool:
    """Notify about plan intake results"""
    if not plans_downloaded and not errors:
        return True  # Nothing to report
    
    message_parts = []
    
    if plans_downloaded:
        message_parts.append(f"**{len(plans_downloaded)} plans downloaded:**")
        for plan in plans_downloaded[:10]:  # Limit to 10
            message_parts.append(f"• {plan}")
        if len(plans_downloaded) > 10:
            message_parts.append(f"• ... and {len(plans_downloaded) - 10} more")
    
    if errors:
        message_parts.append(f"\n⚠️ **{len(errors)} errors:**")
        for error in errors[:5]:
            message_parts.append(f"• {error}")
    
    color = "00FF00" if not errors else "FFA500"
    return send_teams_notification("Plan Intake Complete", "\n".join(message_parts), color=color)

def notify_completeness_check(total: int, complete: int, incomplete: int, 
                             incomplete_jobs: list = None) -> bool:
    """Notify about completeness check results"""
    message_parts = [
        f"**Summary:**",
        f"• Total Jobs: {total}",
        f"• Complete: {complete} ✓",
        f"• Incomplete: {incomplete} ⚠️",
    ]
    
    if incomplete_jobs and incomplete > 0:
        message_parts.append(f"\n**Incomplete Jobs:**")
        for job in incomplete_jobs[:10]:
            message_parts.append(f"• {job.get('subdivision', '?')} - {job.get('lot', '?')}")
            if job.get('missing'):
                message_parts.append(f"  Missing: {', '.join(job['missing'][:3])}")
    
    color = "00FF00" if incomplete == 0 else "FFA500"
    return send_teams_notification("Completeness Check", "\n".join(message_parts), color=color)

def notify_pdss_updated(new_jobs: int = 0, updated_jobs: int = 0, 
                       archived_jobs: int = 0) -> bool:
    """Notify about PDSS sync results"""
    message_parts = [
        "**PDSS Sync Complete**",
        f"• New Jobs: {new_jobs}",
        f"• Updated: {updated_jobs}",
        f"• Archived: {archived_jobs}",
    ]
    
    color = "0076D7"  # Blue for info
    return send_teams_notification("PDSS Sync", "\n".join(message_parts), color=color)

def notify_backup_complete(backup_type: str, files: int, size_mb: float, 
                          destination: str = None) -> bool:
    """Notify about backup completion"""
    message_parts = [
        f"**{backup_type.title()} Backup Complete**",
        f"• Files: {files:,}",
        f"• Size: {size_mb:.1f} MB",
    ]
    
    if destination:
        message_parts.append(f"• Location: {destination}")
    
    return send_teams_notification("Backup Complete", "\n".join(message_parts), color="00FF00")

def notify_error(agent_name: str, error_message: str, details: str = None) -> bool:
    """Send error notification"""
    message_parts = [
        f"**Agent:** {agent_name}",
        f"**Error:** {error_message}",
    ]
    
    if details:
        message_parts.append(f"\n**Details:**\n{details[:500]}")
    
    return send_teams_notification(
        f"⚠️ Agent Error: {agent_name}", 
        "\n".join(message_parts), 
        channel="alerts",
        color="FF0000"
    )

def notify_supplypro_report(dashboard: dict, epo_summary: dict, 
                           documents: dict = None) -> bool:
    """Send SupplyPro daily report notification"""
    message_parts = [
        "**Dashboard:**",
        f"• New Orders: {dashboard.get('new_orders', 0):,}",
        f"• To Do: {dashboard.get('to_do', 0):,}",
        f"• Change Orders: {dashboard.get('change_orders', 0)}",
        "",
        "**EPO Summary:**",
        f"• Total: {epo_summary.get('total', 0)} (${epo_summary.get('total_amount', 0):,.2f})",
        f"• Pending: {epo_summary.get('pending', 0)} (${epo_summary.get('pending_amount', 0):,.2f})",
    ]
    
    if documents:
        message_parts.append(f"\n**New Documents:** {documents.get('total_unviewed', 0)} unviewed")
    
    color = "FFA500" if epo_summary.get('pending', 0) > 0 else "0076D7"
    return send_teams_notification("SupplyPro Daily Report", "\n".join(message_parts), color=color)

# =============================================================================
# TESTING
# =============================================================================

def test_webhook() -> bool:
    """Test the webhook connection"""
    return send_teams_notification(
        "🔧 STO Agents Test",
        "This is a test notification from STO Agents.\n\nIf you can see this, your webhook is configured correctly!",
        color="00FF00"
    )

# =============================================================================
# CLI
# =============================================================================

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Teams Notification Service")
    parser.add_argument("--test", action="store_true", help="Send test notification")
    parser.add_argument("--message", type=str, help="Send custom message")
    parser.add_argument("--title", type=str, default="STO Agents", help="Message title")
    
    args = parser.parse_args()
    
    if args.test:
        success = test_webhook()
        print(f"Test notification {'sent successfully' if success else 'FAILED'}")
    elif args.message:
        success = send_teams_notification(args.title, args.message)
        print(f"Notification {'sent successfully' if success else 'FAILED'}")
    else:
        webhook_url = get_webhook_url()
        if webhook_url:
            print(f"Webhook configured: {webhook_url[:50]}...")
        else:
            print("⚠️ No webhook URL configured!")
            print("\nTo configure:")
            print("1. Set TEAMS_WEBHOOK_URL environment variable")
            print("2. Or update config/settings.py")
