"""
core/classify.py — Haiku keyword classification for untagged bills and opinions.

Runs weekly via auto-data-keywords.yml. Fetches unclassified documents from
the backend Worker, sends each to Claude Haiku for legal classification,
then POSTs the tags back via the ingest Worker.

Auth:   CLAUDE_API_KEY (GitHub Actions secret)
Cost:   ~$0.001/document at Haiku pricing
"""

import os
import sys

sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent.parent))

SOURCE = "haiku_classify"
CLAUDE_API_KEY = os.environ.get("CLAUDE_API_KEY", "")
BACKEND_URL = "https://backend.hlii.net"

CLASSIFY_PROMPT = """Analyze this legal document and return JSON only, no other text:
{
  "legal_area": "one of: constitutional, criminal, civil_rights, administrative, property, immigration, environmental, family, corporate, labor, other",
  "impact_level": "one of: landmark, significant, routine",
  "affected_rights": ["list of 0-5 right or interest categories affected"],
  "prior_references": ["list of case names or bill numbers explicitly cited"],
  "summary_sentence": "one sentence under 25 words",
  "key_terms": ["5-10 most legally significant terms from this document"]
}

Document:
"""


def classify_pending() -> None:
    # TODO: implement classification pipeline
    # 1. GET {BACKEND_URL}/classify/pending — fetch unclassified doc IDs + full text from R2
    # 2. For each doc, POST to Claude Haiku API with CLASSIFY_PROMPT + text[:3000]
    # 3. Parse JSON response
    # 4. POST tags back to {BACKEND_URL}/classify/tag with doc_id + classification
    print(f"[{SOURCE}] stub — not yet implemented")


if __name__ == "__main__":
    classify_pending()
    print(f"[{SOURCE}] done")
