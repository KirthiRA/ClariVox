"""
AI Service — Transcription + Summarization pipeline
Whisper → HuggingFace BART → spaCy keyword extraction
"""
import whisper
import json
from transformers import pipeline
from typing import Optional

# ── Load models once at startup ──────────────────────────────────────────────
_whisper_model = None
_summarizer = None

def get_whisper():
    global _whisper_model
    if _whisper_model is None:
        import os
        model_size = os.getenv("WHISPER_MODEL", "base")   # base | small | medium | large-v2
        _whisper_model = whisper.load_model(model_size)
    return _whisper_model

def get_summarizer():
    global _summarizer
    if _summarizer is None:
        # BART fine-tuned on CNN/DailyMail — best for meeting summaries
        _summarizer = pipeline(
            "summarization",
            model="facebook/bart-large-cnn",
            device=-1   # CPU; change to 0 for GPU
        )
    return _summarizer

# ── Transcription ─────────────────────────────────────────────────────────────
def transcribe_audio(file_path: str, language: Optional[str] = None) -> dict:
    """Returns {full_text, segments:[{start, end, text}]}"""
    model = get_whisper()
    options = {"language": language} if language else {}
    result = model.transcribe(file_path, **options, verbose=False)

    segments = [
        {"start": s["start"], "end": s["end"], "text": s["text"].strip()}
        for s in result["segments"]
    ]
    return {
        "full_text": result["text"].strip(),
        "segments": segments,
        "language": result.get("language", "en"),
    }

# ── Summarization ─────────────────────────────────────────────────────────────
def summarize_text(text: str, max_length: int = 250) -> str:
    """Short paragraph summary via BART"""
    summarizer = get_summarizer()
    # BART has a 1024 token limit — chunk if needed
    chunk_size = 3000
    if len(text) > chunk_size:
        chunks = [text[i:i+chunk_size] for i in range(0, min(len(text), 12000), chunk_size)]
        summaries = [
            summarizer(chunk, max_length=130, min_length=30, do_sample=False)[0]["summary_text"]
            for chunk in chunks
        ]
        combined = " ".join(summaries)
        return summarizer(combined, max_length=max_length, min_length=50, do_sample=False)[0]["summary_text"]
    return summarizer(text, max_length=max_length, min_length=50, do_sample=False)[0]["summary_text"]

# ── Keyword extraction (spaCy) ────────────────────────────────────────────────
def extract_keywords(text: str) -> list[str]:
    try:
        import spacy
        nlp = spacy.load("en_core_web_sm")
        doc = nlp(text[:10000])
        keywords = list({
            chunk.text.lower() for chunk in doc.noun_chunks
            if len(chunk.text) > 3 and chunk.root.pos_ in {"NOUN", "PROPN"}
        })
        return keywords[:20]
    except Exception:
        return []

# ── Action item detection (rule-based + NLP) ─────────────────────────────────
def extract_action_items(text: str) -> list[str]:
    """Heuristic: sentences with action verbs + assignees"""
    action_verbs = {"follow up", "schedule", "send", "review", "prepare", "update",
                    "create", "assign", "complete", "check", "confirm", "share", "fix"}
    sentences = [s.strip() for s in text.replace("\n", ". ").split(".") if s.strip()]
    actions = []
    for s in sentences:
        s_lower = s.lower()
        if any(verb in s_lower for verb in action_verbs) and len(s) > 20:
            actions.append(s)
    return actions[:10]

# ── Sentiment analysis ────────────────────────────────────────────────────────
def analyze_sentiment(text: str) -> str:
    try:
        sentiment_pipe = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
        result = sentiment_pipe(text[:512])[0]
        label = result["label"].lower()
        return "positive" if label == "positive" else "negative" if label == "negative" else "neutral"
    except Exception:
        return "neutral"

# ── Master pipeline ───────────────────────────────────────────────────────────
def process_meeting(file_path: str, language: Optional[str] = None) -> dict:
    """End-to-end processing. Returns everything needed to populate DB."""
    # 1. Transcribe
    transcript_data = transcribe_audio(file_path, language)
    full_text = transcript_data["full_text"]

    # 2. Summarize
    short_summary = summarize_text(full_text)

    # 3. Extract insights
    keywords = extract_keywords(full_text)
    action_items = extract_action_items(full_text)
    sentiment = analyze_sentiment(full_text)

    return {
        "transcript": transcript_data,
        "summary": {
            "short_summary": short_summary,
            "key_points": [],          # Extend with your own extraction logic
            "action_items": action_items,
            "decisions": [],
            "keywords": keywords,
            "sentiment": sentiment,
        }
    }
