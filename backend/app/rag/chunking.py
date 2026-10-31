from typing import List, Dict, Any

class DocumentChunker:
    def __init__(self, chunk_size: int = 600, overlap: int = 120):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk_document(
        self,
        pages: List[Dict[str, Any]],
        document_id: str,
        merchant_id: str,
        filename: str,
        document_category: str
    ) -> List[Dict[str, Any]]:
        chunks = []
        chunk_idx = 1

        for page in pages:
            page_num = page.get("page_number", 1)
            text = page.get("text", "").strip()
            if not text:
                continue

            start = 0
            while start < len(text):
                end = min(start + self.chunk_size, len(text))
                chunk_text = text[start:end].strip()

                if chunk_text:
                    chunks.append({
                        "chunk_id": f"chunk_{chunk_idx:03d}",
                        "document_id": document_id,
                        "merchant_id": merchant_id,
                        "filename": filename,
                        "document_category": document_category,
                        "page_number": page_num,
                        "content": chunk_text
                    })
                    chunk_idx += 1

                if end >= len(text):
                    break
                start += (self.chunk_size - self.overlap)

        return chunks

chunker = DocumentChunker()
