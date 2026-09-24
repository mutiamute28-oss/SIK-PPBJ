"""Regression tests: upload endpoint + PPH42_KONSTRUKSI tiered journal."""
import os
import io
import base64
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback: read frontend/.env
    from pathlib import Path
    for line in Path("/app/frontend/.env").read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

ADMIN_EMAIL = "mutiamute28@gmail.com"
ADMIN_PASSWORD = "PtSbb2026!"

# Smallest valid PNG (1x1 red pixel)
PNG_BYTES = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
)


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login",
               json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return s


def test_upload_and_fetch_file(session):
    files = {"file": ("test.png", io.BytesIO(PNG_BYTES), "image/png")}
    r = session.post(f"{BASE_URL}/api/upload", files=files)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["name"] == "test.png"
    assert data["content_type"] == "image/png"
    assert data["url"].startswith("/api/files/")
    assert data["storage_path"]

    # Fetch via URL with same cookie session
    r2 = session.get(f"{BASE_URL}{data['url']}")
    assert r2.status_code == 200, r2.text
    assert r2.headers.get("content-type", "").startswith("image/")
    assert len(r2.content) == len(PNG_BYTES)


def test_pph42_konstruksi_tier_journal(session):
    # Create PP doc with PPH42_KONSTRUKSI, tier "Pelaksana - Tanpa Kualifikasi" (4%)
    payload = {
        "doc_type": "PP",
        "entitas": "POLITEKNIK HASNUR",
        "tanggal": "2026-01-05",
        "kegiatan": "TEST_PPH42_KONSTRUKSI_TIER",
        "supplier": "CV Kontraktor Uji",
        "anggaran_status": "Dianggarkan",
        "keterangan": "Test PPh Pasal 4(2) Konstruksi tier 4%",
        "items": [],
        "dpp": 100000000,
        "ppn_enabled": False,
        "pph_code": "PPH42_KONSTRUKSI",
        "pph_tier": "Pelaksana - Tanpa Kualifikasi",
        "pph_rate_override": 4.0,
        "expense_account": "6-10009",
        "payment_account": "1-10002",
        "attachments": [],
    }
    r = session.post(f"{BASE_URL}/api/documents", json=payload)
    assert r.status_code == 200, r.text
    doc = r.json()
    doc_id = doc["id"]
    assert doc["pph_tier"] == "Pelaksana - Tanpa Kualifikasi"
    assert doc["pph_rate_override"] == 4.0

    # Approve every pending step
    for _ in range(10):
        d = session.get(f"{BASE_URL}/api/documents/{doc_id}").json()
        if d["status"] != "pending_approval":
            break
        idx = next(i for i, a in enumerate(d["approvals"]) if a["status"] == "pending")
        rr = session.post(f"{BASE_URL}/api/documents/{doc_id}/approve",
                          json={"step_index": idx, "action": "approve", "note": "ok"})
        assert rr.status_code == 200, rr.text

    d = session.get(f"{BASE_URL}/api/documents/{doc_id}").json()
    assert d["status"] == "approved", d["status"]

    # Generate journal
    r = session.post(f"{BASE_URL}/api/documents/{doc_id}/generate-journal")
    assert r.status_code == 200, r.text
    j = r.json()
    assert j["balanced"] is True, j
    # credit PPh line = 4% * 100jt = 4jt on account 2-10005
    pph_credits = [ln for ln in j["lines"] if ln["account_code"] == "2-10005" and ln["kredit"] > 0]
    assert len(pph_credits) == 1
    assert abs(pph_credits[0]["kredit"] - 4_000_000) < 0.5, pph_credits
    # totals
    assert abs(j["total_debit"] - 100_000_000) < 0.5
    assert abs(j["total_kredit"] - 100_000_000) < 0.5  # 96jt payable + 4jt PPh
