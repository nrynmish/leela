#!/usr/bin/env python3
from __future__ import annotations

import sys
import traceback
from datetime import datetime, timezone
from pathlib import Path

try:
    from dotenv import load_dotenv
except Exception:  # pragma: no cover - optional dependency for local execution
    load_dotenv = None

if load_dotenv is not None:
    load_dotenv(Path(__file__).resolve().parents[1] / ".env")

from app.api.tickets import expire_overdue_tickets
from app.db.database import SessionLocal


def main() -> int:
    session = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        expired = expire_overdue_tickets(session, now)
        print(f"expired_count={len(expired)} checked_at={now.isoformat()}")
        return 0
    except Exception:
        traceback.print_exc()
        return 1
    finally:
        session.close()


if __name__ == "__main__":
    raise SystemExit(main())
