from faster_whisper import WhisperModel
from typing import Optional
import os
import re
import time
import concurrent.futures

_whisper_model = None
_summarizer    = None

# ── Whisper (tiny = fastest) ──────────────────────────────────────────────────
def get_whisper():
    global _whisper_model
    if _whisper_model is None:
        model_size = os.getenv("WHISPER_MODEL", "tiny")
        print(f"[Clarivox] Loading Whisper model: {model_size}")
        _whisper_model = WhisperModel(
            model_size,
            device="cpu",
            compute_type="int8",
            num_workers=2,
            cpu_threads=4,
        )
        print("[Clarivox] Whisper loaded OK")
    return _whisper_model

# ── Summarizer (distilbart = 4x faster than bart-large-cnn) ──────────────────
def get_summarizer():
    global _summarizer
    if _summarizer is None:
        from transformers import pipeline
        print("[Clarivox] Loading summarizer...")
        _summarizer = pipeline(
            "summarization",
            model="sshleifer/distilbart-cnn-6-6",
            device=-1,
            framework="pt",
        )
        print("[Clarivox] Summarizer loaded OK")
    return _summarizer

# ── Transcription ─────────────────────────────────────────────────────────────
def transcribe_audio(file_path: str, language: Optional[str] = None) -> dict:
    model   = get_whisper()
    options = {}
    if language and language not in ("auto", "en"):
        options["language"] = language

    segments_iter, info = model.transcribe(
        file_path,
        beam_size=1,
        best_of=1,
        temperature=0,
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=500),
        **options
    )

    segments        = []
    full_text_parts = []
    for seg in segments_iter:
        segments.append({
            "start": round(seg.start, 2),
            "end":   round(seg.end,   2),
            "text":  seg.text.strip()
        })
        full_text_parts.append(seg.text.strip())

    return {
        "full_text": " ".join(full_text_parts),
        "segments":  segments,
        "language":  info.language,
    }

# ── Summarization ─────────────────────────────────────────────────────────────
def summarize_text(text: str, max_length: int = 150) -> str:
    if not text or len(text.strip()) < 30:
        return "Transcript too short to summarize."

    # Truncate for speed — distilbart handles up to 1024 tokens (~4000 chars)
    text = text[:4000]

    try:
        summarizer = get_summarizer()
        result = summarizer(
            text,
            max_length=max_length,
            min_length=40,
            do_sample=False,
            truncation=True,
        )
        return result[0]["summary_text"]
    except Exception as e:
        print(f"[Clarivox] Summarizer failed: {e} — using extractive fallback")
        sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 20]
        return '. '.join(sentences[:3]) + '.' if sentences else text[:300]

# ── Keyword extraction ────────────────────────────────────────────────────────
def extract_keywords(text: str) -> list:
    try:
        import spacy
        nlp = spacy.load("en_core_web_sm")
        doc = nlp(text[:5000])
        keywords = list({
            chunk.text.lower() for chunk in doc.noun_chunks
            if len(chunk.text) > 3 and chunk.root.pos_ in {"NOUN", "PROPN"}
        })
        return keywords[:15]
    except Exception:
        # Fallback: word frequency without spaCy
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
        stopwords = {
            'that','this','with','from','they','have','been','were','will',
            'would','could','should','their','there','about','which','when',
            'what','your','into','more','also','than','then','just','like',
            'some','only','other','after','over','such','very','most','both',
            'through','during','before','between','each','many','those',
            'these','same','under','while','does','doing','where'
        }
        freq = {}
        for w in words:
            if w not in stopwords:
                freq[w] = freq.get(w, 0) + 1
        return [w for w, _ in sorted(freq.items(), key=lambda x: -x[1])[:15]]

# ── Action item extraction ────────────────────────────────────────────────────
def extract_action_items(text: str) -> list:
    action_verbs = {
        "follow up", "schedule", "send", "review", "prepare", "update",
        "create", "assign", "complete", "check", "confirm", "share", "fix",
        "make sure", "reach out", "set up", "look into", "need to",
        "should", "will", "must", "have to"
    }
    sentences = [s.strip() for s in text.replace("\n", ". ").split(".") if s.strip()]
    actions   = []
    for s in sentences:
        if any(v in s.lower() for v in action_verbs) and 20 < len(s) < 200:
            actions.append(s)
    return actions[:8]

# ── Sentiment analysis (fast keyword-based, no model load) ───────────────────
def analyze_sentiment(text: str) -> str:
    text_lower = text.lower()[:2000]
    positive_words = {
        'good','great','excellent','amazing','wonderful','successful',
        'achieved','completed','improved','progress','positive','happy',
        'pleased','effective','efficient','best','better','outstanding','accomplish'
    }
    negative_words = {
        'bad','poor','failed','issue','problem','concern','difficult',
        'challenge','delay','miss','wrong','error','conflict','negative',
        'worse','worst','terrible','struggle','behind','overdue'
    }
    pos_count = sum(1 for w in positive_words if w in text_lower)
    neg_count = sum(1 for w in negative_words if w in text_lower)

    if pos_count > neg_count + 2:
        return "positive"
    elif neg_count > pos_count + 2:
        return "negative"
    return "neutral"

# ── Master pipeline ───────────────────────────────────────────────────────────
def process_meeting(file_path: str, language: Optional[str] = None) -> dict:
    t0 = time.time()

    # Step 1 — Transcribe
    print(f"[Clarivox] Transcribing: {file_path}")
    transcript_data = transcribe_audio(file_path, language)
    full_text       = transcript_data["full_text"]
    print(f"[Clarivox] Transcription done in {time.time()-t0:.1f}s — {len(full_text)} chars")

    # No speech detected
    if not full_text.strip():
        return {
            "transcript": transcript_data,
            "summary": {
                "short_summary": "No speech detected in the audio file.",
                "key_points":    [],
                "action_items":  [],
                "decisions":     [],
                "keywords":      [],
                "sentiment":     "neutral",
            }
        }

    # Step 2 — Run all analysis in parallel (saves 60–70% time)
    t1 = time.time()
    print("[Clarivox] Running analysis in parallel...")

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        f_summary   = executor.submit(summarize_text,       full_text)
        f_keywords  = executor.submit(extract_keywords,     full_text)
        f_actions   = executor.submit(extract_action_items, full_text)
        f_sentiment = executor.submit(analyze_sentiment,    full_text)

        short_summary = f_summary.result()
        keywords      = f_keywords.result()
        action_items  = f_actions.result()
        sentiment     = f_sentiment.result()

    print(f"[Clarivox] Analysis done in {time.time()-t1:.1f}s")
    print(f"[Clarivox] Total processing time: {time.time()-t0:.1f}s")

    return {
        "transcript": transcript_data,
        "summary": {
            "short_summary": short_summary,
            "key_points":    [],
            "action_items":  action_items,
            "decisions":     [],
            "keywords":      keywords,
            "sentiment":     sentiment,
        }
    }