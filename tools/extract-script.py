#!/usr/bin/env python3
"""Extract the exam script PDF to text with page markers, into .source/.

Requires pypdf. The output is gitignored course material.
"""
import pathlib
import sys

import pypdf

DEFAULT_PDF = (
    "../Applied-Programming-2026/applied_programming_project/"
    "Lecture slides/Applied_Programming_Exam_Script.pdf"
)

CONTROL_CHARS = {c: None for c in range(32) if c not in (9, 10)}
CONTROL_CHARS[127] = None


def main():
    pdf_path = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_PDF)
    if not pdf_path.exists():
        sys.exit(f"not found: {pdf_path}")

    out_dir = pathlib.Path(".source")
    out_dir.mkdir(exist_ok=True)

    reader = pypdf.PdfReader(str(pdf_path))
    chunks = []
    for index, page in enumerate(reader.pages, start=1):
        chunks.append(f"=== PAGE {index} ===")
        chunks.append((page.extract_text() or "").translate(CONTROL_CHARS))

    out_path = out_dir / "script.txt"
    out_path.write_text("\n".join(chunks), encoding="utf-8")
    print(f"{out_path}: {len(reader.pages)} pages, {out_path.stat().st_size} bytes")


if __name__ == "__main__":
    main()
