import sqlite3
from pathlib import Path
from typing import Optional, List
from datetime import datetime
from fastapi import HTTPException, status
from .db_init import DB_PATH
from pydantic import BaseModel
import traceback

class HistoryItem(BaseModel):
    id: int
    text: str
    label: str
    score: Optional[float] = None
    created_at: str
    normalized_text: Optional[str] = None

def save_to_db(text: str, label: str, score: float, normalized_text: Optional[str] = None):
    try:
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO logs (text, normalized_text, label, score, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (text, normalized_text, label, score, datetime.now().isoformat())
        )
        conn.commit()
        conn.close()
    except sqlite3.Error as e:
        print(f"Database error saving to db: {e}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: Failed to save sentiment analysis result"
        )
    except Exception as e:
        print(f"Unexpected error saving to database: {e}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save sentiment analysis result: {str(e)}"
        )


def get_history_from_db(search: Optional[str] = None) -> List[HistoryItem]:
    try:
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        
        if search:
            cursor.execute(
                """
                SELECT id, text, label, score, created_at, normalized_text
                FROM logs
                WHERE text LIKE ? OR label LIKE ? OR created_at LIKE ?
                ORDER BY created_at DESC
                LIMIT 100
                """,
                (f"%{search}%", f"%{search}%", f"%{search}%")
            )
        else:
            cursor.execute(
                """
                SELECT id, text, label, score, created_at
                FROM logs
                ORDER BY created_at DESC
                LIMIT 100
                """
            )
        
        rows = cursor.fetchall()
        conn.close()
        
        return [
            HistoryItem(
                id=row[0],
                text=row[1],
                label=row[2],
                score=row[3],
                created_at=row[4],
                normalized_text=row[5]
            )
            for row in rows
        ]
    except sqlite3.Error as e:
        print(f"Database error fetching history: {e}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: Failed to fetch sentiment history"
        )
    except Exception as e:
        print(f"Unexpected error fetching from database: {e}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sentiment history: {str(e)}"
        )
