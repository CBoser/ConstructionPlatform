"""
SupplyPro Portal Configuration
Edit this file to change which communities are monitored.
"""

# =============================================================================
# MONITORED COMMUNITIES
# =============================================================================
# Only these communities will appear in reports.
# Comment out (add #) communities you don't want to track.
# Add new communities as needed.

MONITORED_COMMUNITIES = [
    "Luden Estates Phase 3",
    "North Haven",              # Catches "North Haven" at community level
    "North Haven Phase 4",      # Catches lot-level documents
    "Reserve at Battle Creek",
    "Verona Heights",
    
    # ─── INACTIVE COMMUNITIES (uncomment to enable) ───
    # "Boones Crossing",
    # "Cascadia Ridge",
    # "Cooper Grove Estates",
    # "Copper Heights",
    # "Emerald Meadows",
    # "Frog Pond Phase 2",
    # "Frog Pond Ridge",
    # "Kemmer Ridge",
    # "Kemper Grove",
    # "Kemper Loop",
    # "Laurel Woods",
    # "Magnolia Heights",
    # "Mill Creek Meadow",
    # "Moonlight",
    # "Parkers Landing",
    # "Redwood Landing",
    # "Redwood Landing II",
    # "Reed's Crossing",
    # "Reed's Crossing Phase 1BC",
    # "Reed's Crossing Phase 2A",
    # "Reed's Crossing Phase 2D",
    # "Reed's Crossing Phase 3AB",
    # "Riverwalk at Lewis River",
    # "Scholls Heights",
    # "Scouters Mountain",
    # "Seasons at Maple Grove",
    # "Spyglass Hill",
    # "Stonegate at Bull Mountain",
    # "Trailhead Estates",
    # "Windust Meadows",
]

# =============================================================================
# LOT PREFIX MAPPING
# =============================================================================
# Maps lot number prefixes to communities.
# Used when documents are filed at lot-level without community name.
# Format: "prefix": "Community Name"

LOT_PREFIX_MAP = {
    "33750": "North Haven Phase 4",       # North Haven lots
    "36190": "Luden Estates Phase 3",     # Luden Estates lots
    "34040": "Verona Heights",            # Verona Heights lots
    "35800": "Reserve at Battle Creek",   # Battle Creek lots
    "36199": "Luden Estates Phase 3",     # Additional Luden prefix
}

# =============================================================================
# REPORT SETTINGS
# =============================================================================

REPORT_CONFIG = {
    # How many days back to look for EPOs
    "epo_days_back": 30,
    
    # How many days back to look for new documents
    "documents_days_back": 7,
    
    # Only show unviewed documents (True) or all documents (False)
    "unviewed_only": True,
}

# =============================================================================
# DOCUMENT PRIORITY
# =============================================================================
# Documents containing these keywords will be highlighted in reports.

PRIORITY_DOCUMENTS = [
    "ARCH DRAWINGS",
    "CALC PKG",
    "TRUSS CALCS",
    "FLOOR TRUSS CALCS",
    "ROOF TRUSS CALCS",
    "TRUSS LAYOUT",
    "FLOOR TRUSS LAYOUT",  
    "ROOF TRUSS LAYOUT",
    "JIO",                  # Job Information Order
]

MEDIUM_PRIORITY_DOCUMENTS = [
    "HCO",                  # Home Configuration Order
    "PLOT PLAN",
    "RENDERINGS",
]

LOW_PRIORITY_DOCUMENTS = [
    "PERMIT",
    "EROSION",
    "STORMWATER",
    "GEO REPORT",
]

# =============================================================================
# SUPPLYPRO CREDENTIALS (set via environment variables)
# =============================================================================
# Don't put actual credentials here!
# Set these as environment variables:
#   SUPPLYPRO_USER=your_username
#   SUPPLYPRO_PASS=your_password

import os

SUPPLYPRO_URL = "https://www.hyphensolutions.com/MH2Supply/"
SUPPLYPRO_USER = os.environ.get("SUPPLYPRO_USER", "")
SUPPLYPRO_PASS = os.environ.get("SUPPLYPRO_PASS", "")
SUPPLYPRO_ACCOUNT = "Sekisui House U.S., Inc. - Portland Division - Ric"
