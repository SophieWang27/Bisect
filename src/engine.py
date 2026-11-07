import json
from dataclasses import dataclass, field
from pathlib import Path

DATA_PATH = Path(__file__).parent/"data"/"topics.json"
with open(DATA_PATH, encoding="utf-8") as f:
    TOPICS = json.load(f)

# constant for the number of topics that the diagnosis can check
MAX_DIAG_CHECK = 5
# number of times a student can fail a test before moving on
MAX_RETRIES = 2

@dataclass
class State:
    target_topic: str # topic that the user picked
    current_topic: str # topic thats being asked currently
    phase: str = "diagnosing" # diagnosing/lesson/retesting/done
    q_index: int = 0 # 0 = first question, 1 = 2nd question/confirmation, 2 = 3rd question/retest
    status: dict = field(default_factory=dict)        # topic -> mastered / gap / untested
    wrong_picks: dict = field(default_factory=dict)   # topic -> wrong option picked
    gap_chain: list = field(default_factory=list)     # confirmed gaps, top to bottom (last one is the root cause)
    retest_queue: list = field(default_factory=list)  # topics to retest, bottom to top
    checked: int = 0             # topics checked so far
    attempts: int = 0            # failed retests on the current topic
    root: str = None             # root cause, once found

def start(target_topic):
    s = State(target_topic=target_topic, current_topic=target_topic)
    s.status = {t: "untested" for t in TOPICS}
    return s

def current_question(s):
    return TOPICS[s.current_topic]["questions"][s.q_index]

def submit_answer(s, choice):
    correct = (choice == current_question(s)["correct"])
    if s.phase == "diagnosing":
        diagnose_step(s, choice, correct)
    elif s.phase == "retesting":
        retest_step(s, choice, correct)
    return s


def start_retest(s):                  # call after the lesson is shown
    s.phase = "retesting"
    s.current_topic, s.q_index = s.retest_queue[0], 2

def diagnose_step(s, choice, correct):
    if correct:
        s.status[s.current_topic] = "mastered"
        s.checked += 1
        return finish_diagnosis(s)
    s.wrong_picks[s.current_topic] = choice
    if s.q_index == 0:                # first miss: ask the confirmation question
        s.q_index = 1
        return
    s.status[s.current_topic] = "gap" # second miss: confirmed gap
    s.checked += 1
    s.gap_chain.append(s.current_topic)
    prereqs = TOPICS[s.current_topic]["prereqs"]
    if prereqs and s.checked < MAX_DIAG_CHECK:
        s.current_topic, s.q_index = prereqs[0], 0   # go down one topic
    else:
        finish_diagnosis(s)

def finish_diagnosis(s):
    if not s.gap_chain:               # no confirmed gap, so it was careless
        s.phase = "done"
        return
    s.root = s.gap_chain[-1]          # deepest confirmed gap
    s.retest_queue = list(reversed(s.gap_chain))
    s.current_topic = s.root
    s.phase = "lesson"

def retest_step(s, choice, correct):
    if correct or s.attempts + 1 >= MAX_RETRIES:
        s.status[s.current_topic] = "mastered" if correct else "gap"
        s.retest_queue.pop(0)
        s.attempts = 0
        if not s.retest_queue:
            s.phase = "done"
        else:
            s.current_topic = s.retest_queue[0]
    else:
        s.attempts += 1
        s.wrong_picks[s.current_topic] = choice
        s.phase = "lesson"

def chain_length(topic):
    """How many topics are in the chain from this topic down to the bottom."""
    n = 1
    while TOPICS[topic]["prereqs"]:
        topic = TOPICS[topic]["prereqs"][0]
        n += 1
    return n


def make_message(s):
    target = TOPICS[s.target_topic]["name"]
    if s.phase == "lesson" and s.root:
        root = TOPICS[s.root]["name"]
        if s.root == s.target_topic:
            return f"Your gap is {root}."
        return f"Your gap isn't {target}. It's {root}."
    if s.phase == "done":
        if not s.gap_chain:
            return f"Nice work. That was just a careless mistake, and you know {target}."
        fixed = sum(1 for t in s.gap_chain if s.status[t] == "mastered")
        return f"You fixed {fixed} gaps and mastered {target}."
    return None


def to_response(s):
    q = None
    if s.phase in ("diagnosing", "retesting"):
        raw = current_question(s)
        q = {"id": raw["id"], "topic": s.current_topic,
             "text": raw["text"], "options": raw["options"]}
    return {
        "phase": s.phase,
        "question": q,
        "progress": {"current": s.checked, "total": chain_length(s.target_topic)},
        "map": s.status,
        "highlight": s.root,
        "message": make_message(s),
    }

def lesson_info(s):
    topic = TOPICS[s.root]
    qi = 2 if s.attempts > 0 else 1     # which question the last wrong pick came from
    q = topic["questions"][qi]
    pick = s.wrong_picks[s.root]
    return {
        "topic": topic["name"],
        "notes": topic.get("notes", ""),
        "question": q["text"],
        "picked": q["options"][pick],
        "correct": q["options"][q["correct"]],
        "mistake": q["mistakes"].get(str(pick), ""),
    }