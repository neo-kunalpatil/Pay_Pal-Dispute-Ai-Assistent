import hashlib
from typing import List
from app.core.config import settings

class EmbeddingService:
    def __init__(self):
        self._model = None

    def _get_sentence_transformer(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
            except Exception:
                self._model = False
        return self._model

    def generate_embedding(self, text: str) -> List[float]:
        # Try sentence-transformers if available
        model = self._get_sentence_transformer()
        if model:
            try:
                vec = model.encode(text).tolist()
                return [round(float(v), 5) for v in vec]
            except Exception:
                pass

        # Deterministic 384-dimensional fallback vector based on hashing
        vec = []
        for i in range(384):
            val = int(hashlib.md5(f"{text}_{i}".encode()).hexdigest(), 16) % 2000 - 1000
            vec.append(round(val / 1000.0, 5))
        return vec

embedding_service = EmbeddingService()
