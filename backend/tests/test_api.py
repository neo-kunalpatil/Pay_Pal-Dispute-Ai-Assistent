import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "DisputePilot" in data["app"]

def test_dashboard_overview():
    response = client.get("/api/v1/dashboard/overview")
    assert response.status_code == 200
    data = response.json()
    assert "stats" in data
    assert "recentDisputes" in data
    assert len(data["recentDisputes"]) > 0

def test_list_disputes():
    response = client.get("/api/v1/disputes")
    assert response.status_code == 200
    disputes = response.json()
    assert isinstance(disputes, list)
    assert any(d["id"] == "PP-D-12345" for d in disputes)

def test_dispute_details():
    response = client.get("/api/v1/disputes/PP-D-12345")
    assert response.status_code == 200
    dispute = response.json()
    assert dispute["id"] == "PP-D-12345"
    assert dispute["amount"] == 800.00
    assert len(dispute["timeline"]) > 0

def test_paypal_connection_status():
    response = client.get("/api/v1/paypal/connection")
    assert response.status_code == 200
    data = response.json()
    assert "environment" in data
    assert "allowedActions" in data
