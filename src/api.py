import os
import time
from dotenv import load_dotenv
from google import genai

load_dotenv() 

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set. Check backend/.env")
print("Key loaded:", bool(api_key)) 

client = genai.Client(api_key=api_key)
print("Client created")

response = client.models.generate_content(
    model="gemini-3.8-flash",     
    contents="Reply with the single word: working",
)
print("Reply:", response.text)

def generate_with_retry(client, retries=4, **kwargs):
    for attempt in range(retries):
        try:
            return client.models.generate_content(**kwargs)
        except genai.errors.ServerError:
            if attempt == retries - 1:
                raise
            time.sleep(2 ** attempt) 
