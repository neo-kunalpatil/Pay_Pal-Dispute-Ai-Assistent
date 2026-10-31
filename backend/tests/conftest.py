import pytest
from app.database.init_db import init_db

@pytest.fixture(scope="session", autouse=True)
def initialize_test_database():
    init_db()
