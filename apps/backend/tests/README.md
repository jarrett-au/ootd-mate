# Backend Tests - Profile Management

## Overview
This directory contains comprehensive unit tests for the Profile Management API endpoints.

## Test Structure
```
tests/
├── __init__.py
├── conftest.py          # Test fixtures and mocks
└── test_profiles.py     # Profile endpoint tests
```

## Running Tests

### Run All Tests
```bash
pytest tests/ -v
```

### Run with Coverage
```bash
pytest tests/ -v --cov=app --cov-report=term-missing --cov-report=html
```

### Run Specific Test Class
```bash
pytest tests/test_profiles.py::TestProfileSchemas -v
pytest tests/test_profiles.py::TestProfileEndpoints -v
pytest tests/test_profiles.py::TestProfileResponse -v
```

### Run Specific Test
```bash
pytest tests/test_profiles.py::TestProfileSchemas::test_valid_profile_create -v
```

## Test Summary

### Total Tests: 24

#### TestProfileSchemas (11 tests)
Tests Pydantic schema validation:
- Valid profile creation
- Boundary value testing
- Field validation rules
- Error cases

#### TestProfileEndpoints (10 tests)
Tests FastAPI endpoints:
- GET /api/profile/ (success and not found)
- PUT /api/profile/ (create and update)
- Validation errors
- User not found scenarios

#### TestProfileResponse (3 tests)
Tests response model conversion:
- from_db() with all fields
- from_db() with optional fields
- Error handling for invalid JSON

## Coverage

Estimated coverage: **90%+**

Covered:
- All API endpoints
- All validation logic
- Error handling paths
- Data transformation

## Fixtures

### mock_prisma
Provides a mocked Prisma client for testing without database dependencies.

### test_user_id
Returns a test user ID: `"test-user-123"`

### sample_profile_data
Returns sample profile data for testing.

## Notes

- Tests use async/await for FastAPI testing
- External dependencies are mocked
- Tests are independent and can run in parallel
- Each test focuses on a single behavior
