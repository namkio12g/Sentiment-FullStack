from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import traceback

from .db.db_init import init_db
from .db.db_helper import save_to_db, get_history_from_db
from .AI.model import predict
from .db.db_helper import HistoryItem


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Sentiment Analysis API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SentimentRequest(BaseModel):
    text: str


class SentimentResponse(BaseModel):
    label: str
    score: float
    normalized_text: Optional[str] = None


class HistoryResponse(BaseModel):
    history: List[HistoryItem]


@app.get("/")
def root():
    return {"message": "Sentiment Analysis API is running"}

@app.post("/hello-world")
def hello_world(request: SentimentRequest):
    text = request.text
    return {"label": text}


@app.post("/sentiment-analyze", response_model=SentimentResponse)
def analyze_sentiment(request: SentimentRequest):
    try:
        if not request.text or not request.text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text is required and cannot be empty"
            )
        
        text = request.text.strip()
        
        sentiment, score, normalized_text = predict(text)
        
        save_to_db(text, sentiment, score, normalized_text)
        
        return SentimentResponse(
            label=sentiment,
            score=score,
            normalized_text=normalized_text
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in analyze_sentiment: {e}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@app.get("/sentiment-history", response_model=HistoryResponse)
def get_history(search: Optional[str] = Query(None, description="Search query for filtering history")):
    try:
        history = get_history_from_db(search)
        return HistoryResponse(history=history)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in get_history: {e}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch history: {str(e)}"
        )
