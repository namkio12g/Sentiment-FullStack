from transformers import pipeline
from underthesea import word_tokenize
from ftfy import fix_text
import unicodedata
import re
from fastapi import HTTPException, status

SLANG_MAP = {
    "rat": "rất",
    "la":"là",
    "k":"không",
    "ko": "không",
    "khong": "không",
    "hqa": "hôm qua",
    "dc": "được",
    "ok": "ổn",
    "te":"tệ",
    "xau":"xấu",
    "dep":"đẹp",
    "do":"dở",
    "hok": "không",
    "hong": "không",
    "ng": "người",
    "mk": "mình",
    "vk": "vợ",
    "ck": "chồng",
    "vs": "với",
    "j": "gì",
    "gj": "gì",
    "lm": "làm",
    "kg": "không",
    "ntn": "như thế nào",
    "thik": "thích",
    "hom":"hôm",
    "mot":"một",
    "ban":"bạn",
    "choi":"chơi",
    "yeu":"yêu"
}

LABEL_MAP = {
    "positive": "POSITIVE",
    "pos": "POSITIVE",
    "negative": "NEGATIVE",
    "neg": "NEGATIVE",
    "neutral": "NEUTRAL",
    "neu": "NEUTRAL"
}

MODEL_NAME = "wonrax/phobert-base-vietnamese-sentiment"


def normalize_sentence(text: str) -> str:
    words = []
    for word in text.split():
        key = word.lower()
        words.append(SLANG_MAP.get(key, word))
    normalized = " ".join(words)
    normalized = unicodedata.normalize("NFC", normalized)
    normalized = re.sub(r"\s+", " ", normalized).strip()
    return normalized


def limit_length(text: str, max_len: int = 256) -> str:
    if len(text) > max_len:
        truncated = text[:max_len]
        last_space = truncated.rfind(" ")
        if last_space > max_len * 0.8:
            return truncated[:last_space]
        return truncated
    return text


def word_segment(text: str) -> str:
    try:
        segmented = word_tokenize(text, format="text")
        return segmented
    except Exception as e:
        print(f"Warning: underthesea segmentation failed: {e}")
        return " ".join(text.split())


def preprocess(text: str) -> dict:
    if text is None:
        raise HTTPException(status_code=400, detail="Text is required")
    if text.strip() == "":
        raise HTTPException(status_code=400, detail="Text is required")
    if text.split().__len__() < 3:
        raise HTTPException(status_code=400, detail="Text is too short, please enter at least 3 words")
    if text.split().__len__() > 10:
        raise HTTPException(status_code=400, detail="Text is too long, please enter at most 10 words")

    cleaned = fix_text(str(text))
    normalized_text = normalize_sentence(cleaned)
    cleaned = word_segment(normalized_text )
    cleaned = limit_length(cleaned)
    return {"cleaned" :cleaned.strip(),"normalized_text":normalized_text}


classifier = pipeline(
    "sentiment-analysis",
    model=MODEL_NAME,
    tokenizer=MODEL_NAME
)


def predict(text):
    try:
        result = preprocess(text)
        prepared = result["cleaned"]
        normalized_text = result["normalized_text"]

        if not prepared:
            return "NEUTRAL", 0.5, normalized_text

        out = classifier(prepared, truncation=True, max_length=256)[0]
        raw_label = out.get("label", "")
        score = float(out.get("score", 0.0))

        sentiment = LABEL_MAP.get(raw_label.lower(), "NEUTRAL")

        if score < 0.5:
            sentiment = "NEUTRAL"

        return sentiment, score, normalized_text

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in predict: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze sentiment: {str(e)}"
        )
