"""Privacy-conscious SQLite storage for anonymous classroom activity."""

import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path


TOPIC_ORDER = ("twos_complement", "bit_flip", "place_value", "powers_of_two")
VALID_TAGS = ("terms", "exam", "time", "examples", "behind", "practice")
DEFAULT_DB_PATH = Path(__file__).resolve().parents[1] / "bisect.sqlite3"
DB_PATH = Path(os.getenv("BISECT_DB_PATH") or str(DEFAULT_DB_PATH)).expanduser()
CLASS_ID = os.getenv("BISECT_CLASS_ID", "default")
RETENTION_DAYS = max(1, int(os.getenv("BISECT_RETENTION_DAYS", "90")))


def _connect():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys=ON")
    connection.execute("PRAGMA busy_timeout=10000")
    return connection


@contextmanager
def _database():
    db = _connect()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def initialize_database():
    with _database() as db:
        db.execute("PRAGMA journal_mode=WAL")
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS answer_events (
                event_id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                class_id TEXT NOT NULL,
                topic_id TEXT NOT NULL,
                question_id TEXT NOT NULL,
                phase TEXT NOT NULL,
                correct INTEGER NOT NULL CHECK (correct IN (0, 1)),
                answer_mode TEXT NOT NULL,
                learner_language TEXT NOT NULL,
                course_language TEXT NOT NULL,
                occurred_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_answers_class_time
                ON answer_events(class_id, occurred_at);
            CREATE INDEX IF NOT EXISTS idx_answers_session
                ON answer_events(class_id, session_id);

            CREATE TABLE IF NOT EXISTS outcomes (
                session_id TEXT NOT NULL,
                class_id TEXT NOT NULL,
                start_topic TEXT NOT NULL,
                root_topic TEXT,
                outcome TEXT NOT NULL,
                occurred_at TEXT NOT NULL,
                PRIMARY KEY (class_id, session_id)
            );
            CREATE INDEX IF NOT EXISTS idx_outcomes_class_time
                ON outcomes(class_id, occurred_at);

            CREATE TABLE IF NOT EXISTS student_tags (
                class_id TEXT NOT NULL,
                session_id TEXT NOT NULL,
                tag_id TEXT NOT NULL,
                occurred_at TEXT NOT NULL,
                PRIMARY KEY (class_id, session_id, tag_id)
            );
            CREATE INDEX IF NOT EXISTS idx_tags_class_time
                ON student_tags(class_id, occurred_at);
            """
        )
        cutoff = (datetime.now(timezone.utc) - timedelta(days=RETENTION_DAYS)).isoformat()
        db.execute("DELETE FROM answer_events WHERE occurred_at < ?", (cutoff,))
        db.execute("DELETE FROM outcomes WHERE occurred_at < ?", (cutoff,))
        db.execute("DELETE FROM student_tags WHERE occurred_at < ?", (cutoff,))


def record_answer(event: dict):
    occurred_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with _database() as db:
        db.execute(
            """INSERT OR IGNORE INTO answer_events
            (event_id, session_id, class_id, topic_id, question_id, phase, correct,
             answer_mode, learner_language, course_language, occurred_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                event["event_id"], event["session_id"], CLASS_ID, event["topic_id"],
                event["question_id"], event["phase"], int(event["correct"]),
                event["answer_mode"], event["learner_language"],
                event["course_language"], occurred_at,
            ),
        )


def record_outcome(session_id: str, start_topic: str, root_topic: str | None, outcome: str):
    occurred_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with _database() as db:
        db.execute(
            """INSERT INTO outcomes (session_id, class_id, start_topic, root_topic, outcome, occurred_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(class_id, session_id) DO UPDATE SET
                start_topic=excluded.start_topic,
                root_topic=excluded.root_topic,
                outcome=excluded.outcome,
                occurred_at=excluded.occurred_at""",
            (session_id, CLASS_ID, start_topic, root_topic, outcome, occurred_at),
        )


def record_tags(session_id: str, tag_ids: list[str]):
    occurred_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with _database() as db:
        db.execute(
            "DELETE FROM student_tags WHERE class_id = ? AND session_id = ?",
            (CLASS_ID, session_id),
        )
        db.executemany(
            "INSERT INTO student_tags (class_id, session_id, tag_id, occurred_at) VALUES (?, ?, ?, ?)",
            [(CLASS_ID, session_id, tag_id, occurred_at) for tag_id in tag_ids],
        )


def teacher_summary() -> dict:
    with _database() as db:
        active_sessions = db.execute(
            "SELECT COUNT(DISTINCT session_id) AS n FROM answer_events WHERE class_id = ?",
            (CLASS_ID,),
        ).fetchone()["n"]
        answer_count = db.execute(
            "SELECT COUNT(*) AS n FROM answer_events WHERE class_id = ?",
            (CLASS_ID,),
        ).fetchone()["n"]
        outcome_rows = db.execute(
            "SELECT outcome, root_topic FROM outcomes WHERE class_id = ?",
            (CLASS_ID,),
        ).fetchall()
        shared_sessions = db.execute(
            "SELECT COUNT(DISTINCT session_id) AS n FROM student_tags WHERE class_id = ?",
            (CLASS_ID,),
        ).fetchone()["n"]
        theme_rows = db.execute(
            "SELECT tag_id, COUNT(*) AS n FROM student_tags WHERE class_id = ? GROUP BY tag_id",
            (CLASS_ID,),
        ).fetchall()
        updated = db.execute(
            """SELECT MAX(updated_at) AS latest FROM (
                SELECT MAX(occurred_at) AS updated_at FROM answer_events WHERE class_id = ?
                UNION ALL
                SELECT MAX(occurred_at) AS updated_at FROM outcomes WHERE class_id = ?
                UNION ALL
                SELECT MAX(occurred_at) AS updated_at FROM student_tags WHERE class_id = ?
            )""",
            (CLASS_ID, CLASS_ID, CLASS_ID),
        ).fetchone()["latest"]

    diagnosed = len(outcome_rows)
    concept_rows = [row for row in outcome_rows if row["outcome"] == "concept_gap"]
    language_gaps = sum(1 for row in outcome_rows if row["outcome"] == "language_gap")
    root_counts = {topic_id: 0 for topic_id in TOPIC_ORDER}
    for row in concept_rows:
        if row["root_topic"] in root_counts:
            root_counts[row["root_topic"]] += 1
    concept_total = len(concept_rows)
    root_gaps = [
        {
            "topic": topic_id,
            "count": count,
            "pct": round(count * 100 / concept_total) if concept_total else 0,
        }
        for topic_id, count in root_counts.items()
        if count
    ]
    root_gaps.sort(key=lambda row: (-row["count"], TOPIC_ORDER.index(row["topic"])))
    themes = {tag_id: 0 for tag_id in VALID_TAGS}
    themes.update({row["tag_id"]: row["n"] for row in theme_rows})
    return {
        "classId": CLASS_ID,
        "activeSessions": active_sessions,
        "diagnosed": diagnosed,
        "conceptGaps": concept_total,
        "languageGaps": language_gaps,
        "sharedSessions": shared_sessions,
        "answerCount": answer_count,
        "rootGaps": root_gaps,
        "themes": themes,
        "updatedAt": updated,
        "retentionDays": RETENTION_DAYS,
    }
