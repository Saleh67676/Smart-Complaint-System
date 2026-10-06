"""Server-only configuration; Groq is the only remote AI provider."""
import os
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env", override=False)
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
LLM_MODEL_CONVERSATION = os.environ.get("LLM_MODEL_CONVERSATION", "openai/gpt-oss-120b")
LLM_MODEL_COPILOT = os.environ.get("LLM_MODEL_COPILOT", LLM_MODEL_CONVERSATION)
DATA_DIR = Path(os.environ.get("DATA_DIR", str(ROOT / "runtime")))
