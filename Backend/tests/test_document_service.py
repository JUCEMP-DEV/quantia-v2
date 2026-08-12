import tempfile
import unittest
from pathlib import Path

from app.services.document_service import DocumentService


class DocumentServiceTests(unittest.TestCase):
    def test_extract_text_from_plain_text_file(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            temp_path = Path(tmp_dir) / "sample.txt"
            temp_path.write_text("Este es un documento de prueba para OCR.", encoding="utf-8")

            service = DocumentService(storage_dir=tmp_dir)
            result = service.process_file(temp_path)

            self.assertEqual(result["status"], "processed")
            self.assertIn("documento de prueba", result["text"])

    def test_extract_text_from_pdf_without_dependencies(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            temp_path = Path(tmp_dir) / "sample.pdf"
            temp_path.write_bytes(b"%PDF-1.4\n%fake")

            service = DocumentService(storage_dir=tmp_dir)
            result = service.process_file(temp_path)

            self.assertEqual(result["status"], "processed")
            self.assertTrue("OCR no disponible" in result["text"] or "No se encontró" in result["text"] or "Error" in result["text"])


if __name__ == "__main__":
    unittest.main()
