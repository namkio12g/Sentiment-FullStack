import sqlite3
from pathlib import Path
from datetime import datetime
import sys
import io

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DB_PATH = Path(__file__).parent / "sentiment.db"

def view_database():
    """View all data in sentiment.db"""
    try:
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        
        # Get table info
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print("Tables in database:")
        for table in tables:
            print(f"  - {table[0]}")
        print()
        
        # Get total count
        cursor.execute("SELECT COUNT(*) FROM logs")
        count = cursor.fetchone()[0]
        print(f"Total records: {count}\n")
        
        if count == 0:
            print("Database is empty.")
            conn.close()
            return
        
        # Get all data
        cursor.execute("""
            SELECT id, text, normalized_text, label, score, created_at 
            FROM logs 
            ORDER BY created_at DESC
        """)
        rows = cursor.fetchall()
        print(rows)
        
        print("=" * 100)
        print(f"{'ID':<5} {'Text':<30} {'Label':<15} {'Score':<10} {'Created At':<20}")
        print("=" * 100)
        
        for row in rows:
            id_val, text, normalized_text, label, score, created_at = row
            # Truncate text if too long
            text_display = text[:27] + "..." if len(text) > 30 else text
            score_display = f"{score:.2f}" if score else "N/A"
            print(f"{id_val:<5} {text_display:<30} {label or 'N/A':<15} {score_display:<10} {created_at or 'N/A':<20}")
        
        print("=" * 100)
        print(f"\nTotal: {len(rows)} records")
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    view_database()

