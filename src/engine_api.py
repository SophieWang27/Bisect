import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from engine import start, submit_answer, start_retest, to_response, lesson_info, TOPICS

router = APIRouter(prefix="/engine")
sessions = {}


class StartReq(BaseModel):
    topic: str

class AnswerReq(BaseModel):
    session_id: str
    choice: int

class SessionReq(BaseModel):
    session_id: str


def get_state(session_id):
    s = sessions.get(session_id)
    if s is None:
        raise HTTPException(404, "unknown session")
    return s


@router.post("/start")
def start_session(req: StartReq):
    if req.topic not in TOPICS:
        raise HTTPException(400, "unknown topic")
    session_id = str(uuid.uuid4())
    sessions[session_id] = start(req.topic)
    return {"session_id": session_id, **to_response(sessions[session_id])}


@router.post("/answer")
def answer(req: AnswerReq):
    s = get_state(req.session_id)
    submit_answer(s, req.choice)
    return to_response(s)


@router.post("/lesson")
def lesson(req: SessionReq):
    s = get_state(req.session_id)
    if not s.root:
        raise HTTPException(400, "no root cause yet")
    return lesson_info(s)


@router.post("/retest")
def retest(req: SessionReq):
    s = get_state(req.session_id)
    start_retest(s)
    return to_response(s)