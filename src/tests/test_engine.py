import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from engine import start, submit_answer, start_retest, to_response, TOPICS


def fail_down(s, times):
    for _ in range(times):
        submit_answer(s, 3)   # option 3 is wrong for every q0 and q1
        submit_answer(s, 3)


def test_careless_mistake_is_not_a_gap():
    s = start("twos_complement")
    submit_answer(s, 1)       # tc1 wrong
    assert s.q_index == 1
    submit_answer(s, 1)       # tc2 right
    assert s.phase == "done"
    assert s.root is None


def test_stops_at_deepest_failed_topic():
    s = start("twos_complement")
    submit_answer(s, 1)       # tc1 wrong
    submit_answer(s, 0)       # tc2 wrong -> gap, go down
    assert s.current_topic == "bit_flipping"
    submit_answer(s, 0)       # bf1 right
    assert s.phase == "lesson"
    assert s.root == "twos_complement"


def test_full_descent_to_powers_of_two():
    s = start("twos_complement")
    fail_down(s, 4)
    assert s.root == "powers_of_two"
    assert s.gap_chain == ["twos_complement", "bit_flipping",
                           "binary_place_value", "powers_of_two"]


def test_climb_back_up():
    s = start("twos_complement")
    fail_down(s, 4)
    start_retest(s)
    while s.phase == "retesting":
        right = TOPICS[s.current_topic]["questions"][2]["correct"]
        submit_answer(s, right)
    assert s.phase == "done"
    assert all(v == "mastered" for v in s.status.values())


def test_failing_retest_twice_marks_gap():
    s = start("twos_complement")
    fail_down(s, 4)
    start_retest(s)
    right = TOPICS["powers_of_two"]["questions"][2]["correct"]
    wrong = (right + 1) % 4
    submit_answer(s, wrong)   # first miss -> back to lesson
    assert s.phase == "lesson"
    start_retest(s)
    submit_answer(s, wrong)   # second miss -> gap, move up
    assert s.status["powers_of_two"] == "gap"
    assert s.current_topic == "binary_place_value"


def test_response_has_no_answers():
    s = start("twos_complement")
    r = to_response(s)
    assert "correct" not in r["question"]
    assert r["progress"]["total"] == 4