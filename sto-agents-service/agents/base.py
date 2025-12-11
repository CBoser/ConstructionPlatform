"""
Base Agent - Abstract base class for all STO agents

All agents should inherit from this class and implement the required methods.
"""

import os
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any


class BaseAgent(ABC):
    """Abstract base class for STO agents"""

    def __init__(self, name: str):
        self.name = name
        self.last_run: datetime | None = None
        self.run_count = 0

    @abstractmethod
    async def run(self) -> dict[str, Any]:
        """Run the agent and return results"""
        pass

    def log(self, message: str, level: str = "info"):
        """Log a message with timestamp"""
        timestamp = datetime.now().isoformat()
        prefix = {
            "info": "INFO",
            "warning": "WARN",
            "error": "ERROR",
            "debug": "DEBUG",
        }.get(level, "INFO")
        print(f"[{timestamp}] [{prefix}] [{self.name}] {message}")

    def get_env(self, key: str, default: str | None = None) -> str | None:
        """Get environment variable with optional default"""
        return os.getenv(key, default)

    def require_env(self, key: str) -> str:
        """Get required environment variable, raise if not set"""
        value = os.getenv(key)
        if not value:
            raise ValueError(f"Required environment variable {key} is not set")
        return value
