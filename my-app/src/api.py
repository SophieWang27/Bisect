import os
import time

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from google import genai
from pydantic import BaseModel

load_dotenv() 

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set. Check backend/.env")
print("Key loaded:", bool(api_key)) 

MODEL = "gemini-3.8-flash"

client = genai.Client(api_key=api_key)
print("Client created")

app = FastAPI()

class AskRequest(BaseModel):
    topic: str

def retry(retries=4, **kwargs):
    for attempt in range(retries):
        try:
            return client.models.generate_content(**kwargs)
        except genai.errors.ServerError:       # 503 overloaded, etc.
            if attempt == retries - 1:
                raise
            time.sleep(2 ** attempt)


@app.post("/explain")
def explain(req: AskRequest):
    try:
        response = retry(
            model=MODEL,
            contents=f"Topic: {req.topic}",
            config=genai.types.GenerateContentConfig(
                system_instruction=(
                    "You are a patient tutor. Explain the topic to a beginner "
                    "in one short paragraph, in plain language."
                ),
                temperature=0.4,
            ),
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini error: {e}")

    return {"text": response.text or ""}
