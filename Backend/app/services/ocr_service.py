from __future__ import annotations

import importlib.util
import re
from pathlib import Path
from typing import Any

from app.core.config import settings


class OCRService:
    text_extensions = {".txt", ".md", ".json"}
    image_extensions = {".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff"}

    def __init__(self, engine: str | None = None):
        self.engine = (engine or settings.ocr_engine).lower().strip()

    def process_document(self, file_path: str | Path) -> dict[str, Any]:
        source_path = Path(file_path)
        if not source_path.exists():
            raise FileNotFoundError(f"No se encontro el archivo: {source_path}")

        extension = source_path.suffix.lower()
        if extension in self.text_extensions:
            pages = [self._read_text(source_path)]
        elif extension == ".pdf":
            pages = self._extract_from_pdf(source_path)
        elif extension in self.image_extensions:
            pages = [self._extract_from_image(source_path)]
        else:
            pages = [""]

        clean_pages = []
        for page in pages:
            clean_page = self._clean_text(page)
            if clean_page:
                clean_pages.append(clean_page)
        text = "\n\n".join(clean_pages)
        return {
            "text": text,
            "metadata": {
                "file_name": source_path.name,
                "extension": extension,
                "ocr_engine": self.engine,
                "page_count": len(clean_pages),
            },
        }

    def _read_text(self, file_path: Path) -> str:
        return file_path.read_text(encoding="utf-8")

    def _extract_from_pdf(self, file_path: Path) -> list[str]:
        embedded_text = self._extract_embedded_pdf_text(file_path)
        if embedded_text:
            return embedded_text
        return self._extract_scanned_pdf_text(file_path)

    def _extract_embedded_pdf_text(self, file_path: Path) -> list[str]:
        if importlib.util.find_spec("pypdf") is None:
            return []

        try:
            from pypdf import PdfReader

            reader = PdfReader(str(file_path))
            pages_text = []
            for page in reader.pages:
                extracted = page.extract_text() or ""
                if extracted.strip():
                    pages_text.append(extracted)
            return pages_text
        except Exception as exc:  # pragma: no cover - defensive path
            return [f"Error al procesar PDF: {exc}"]

    def _extract_scanned_pdf_text(self, file_path: Path) -> list[str]:
        if self.engine != "tesseract":
            return [f"OCR no disponible: motor no soportado ({self.engine})."]
        if importlib.util.find_spec("pdf2image") is None:
            return ["OCR no disponible: pdf2image no esta instalado."]

        try:
            from pdf2image import convert_from_path

            images = convert_from_path(str(file_path))
            return [self._extract_text_from_image_object(image) for image in images]
        except Exception as exc:  # pragma: no cover - depends on Poppler/local files
            return [f"Error al procesar PDF escaneado: {exc}"]

    def _extract_from_image(self, file_path: Path) -> str:
        if self.engine != "tesseract":
            return f"OCR no disponible: motor no soportado ({self.engine})."
        if importlib.util.find_spec("PIL") is None:
            return "OCR no disponible: Pillow no esta instalado."

        try:
            from PIL import Image

            with Image.open(file_path) as image:
                return self._extract_text_from_image_object(image)
        except Exception as exc:  # pragma: no cover - defensive path
            return f"Error al procesar imagen: {exc}"

    def _extract_text_from_image_object(self, image: Any) -> str:
        if importlib.util.find_spec("pytesseract") is None:
            return "OCR no disponible: pytesseract no esta instalado."

        try:
            import pytesseract

            return pytesseract.image_to_string(image)
        except Exception as exc:  # pragma: no cover - depends on local Tesseract
            return f"Error al ejecutar OCR: {exc}"

    def _clean_text(self, text: str) -> str:
        normalized = str(text).replace("\r\n", "\n").replace("\r", "\n")
        normalized = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", " ", normalized)
        normalized = re.sub(r"[ \t\f\v]+", " ", normalized)
        normalized = re.sub(r" *\n *", "\n", normalized)
        normalized = re.sub(r"\n{3,}", "\n\n", normalized)

        paragraphs = []
        for paragraph in normalized.split("\n\n"):
            lines = [line.strip() for line in paragraph.split("\n") if line.strip()]
            if lines:
                paragraphs.append("\n".join(lines))
        return "\n\n".join(paragraphs).strip()


