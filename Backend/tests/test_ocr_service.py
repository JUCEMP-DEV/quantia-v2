import tempfile
import unittest
from pathlib import Path

from app.services.ocr_service import OCRService


class OCRServiceTests(unittest.TestCase):
    def test_process_plain_text_document(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            temp_path = Path(tmp_dir) / "sample.txt"
            temp_path.write_text("Linea uno\n\nLinea dos", encoding="utf-8")

            result = OCRService().process_document(temp_path)

            self.assertEqual(result["text"], "Linea uno\n\nLinea dos")
            self.assertEqual(result["metadata"]["file_name"], "sample.txt")
            self.assertEqual(result["metadata"]["page_count"], 1)

    def test_process_unsupported_document_returns_empty_text(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            temp_path = Path(tmp_dir) / "sample.xyz"
            temp_path.write_text("contenido", encoding="utf-8")

            result = OCRService().process_document(temp_path)

            self.assertEqual(result["text"], "")
            self.assertEqual(result["metadata"]["extension"], ".xyz")
            self.assertEqual(result["metadata"]["page_count"], 0)

    def test_clean_text_normalizes_spaces_and_control_characters(self):
        service = OCRService()

        text = "  Total\t\t de\x00 obra   \n\n\n  Costo   directo  "

        self.assertEqual(service._clean_text(text), "Total de obra\n\nCosto directo")

    def test_clean_text_preserves_paragraph_lines(self):
        service = OCRService()

        text = "Parrafo uno linea uno  \n  linea dos\n\n\nParrafo dos"

        self.assertEqual(service._clean_text(text), "Parrafo uno linea uno\nlinea dos\n\nParrafo dos")
    def test_process_missing_document_raises_error(self):
        with self.assertRaises(FileNotFoundError):
            OCRService().process_document("missing.pdf")


if __name__ == "__main__":
    unittest.main()


