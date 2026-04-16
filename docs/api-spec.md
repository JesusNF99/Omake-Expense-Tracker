# Omake — API Specification (v1.0.0)

> **Single Source of Truth** for all communication between Frontend and Backend.
> Any change to an endpoint MUST be reflected here **before** modifying code.

---

## Base URL

```
http://localhost:8080/api
```

## Authentication

All endpoints under `/api/transactions/**` require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Tokens are obtained via the `/api/auth/login` endpoint and have a configurable expiration time.

---

## Common Error Response

All error responses follow a consistent structure:

```json
{
  "timestamp": "2026-04-10T18:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed: email must be a valid email address.",
  "path": "/api/auth/register"
}
```

---

## Endpoints

### 1. `POST /api/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

| Field      | Type   | Required | Constraints                        |
|------------|--------|----------|------------------------------------|
| `email`    | String | Yes      | Valid email format, unique          |
| `password` | String | Yes      | Min 8 characters                   |

**Response — `201 Created`:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "user@example.com",
  "role": "USER",
  "createdAt": "2026-04-10T18:00:00Z"
}
```

**Error Responses:**

| Status | Condition                          |
|--------|------------------------------------|
| `400`  | Invalid input / validation errors  |
| `409`  | Email already registered           |

---

### 2. `POST /api/auth/login`

Authenticate a user and return a JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

| Field      | Type   | Required |
|------------|--------|----------|
| `email`    | String | Yes      |
| `password` | String | Yes      |

**Response — `200 OK`:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 86400
}
```

**Error Responses:**

| Status | Condition                         |
|--------|-----------------------------------|
| `400`  | Missing or invalid fields         |
| `401`  | Invalid email or password         |

---

### 3. `GET /api/transactions`

Retrieve a paginated list of the authenticated user's transactions, with optional month filtering.

**🔒 Requires Authentication**

**Query Parameters:**

| Parameter | Type    | Required | Default | Description                                      |
|-----------|---------|----------|---------|--------------------------------------------------|
| `page`    | Integer | No       | `0`     | Zero-based page index                            |
| `size`    | Integer | No       | `20`    | Number of records per page (max `100`)           |
| `month`   | String  | No       | —       | Filter by month in `YYYY-MM` format (e.g. `2026-04`) |
| `sort`    | String  | No       | `date,desc` | Sort field and direction                     |

**Example Request:**

```
GET /api/transactions?page=0&size=10&month=2026-04&sort=date,desc
```

**Response — `200 OK`:**

```json
{
  "content": [
    {
      "id": 1,
      "amount": 45.99,
      "date": "2026-04-08",
      "description": "Grocery shopping",
      "category": {
        "id": 2,
        "name": "Food",
        "colorHex": "#FF6B35",
        "iconName": "utensils"
      }
    },
    {
      "id": 2,
      "amount": 120.00,
      "date": "2026-04-05",
      "description": "Monthly gym membership",
      "category": {
        "id": 5,
        "name": "Health",
        "colorHex": "#26C485",
        "iconName": "heart-pulse"
      }
    }
  ],
  "page": {
    "number": 0,
    "size": 10,
    "totalElements": 42,
    "totalPages": 5
  }
}
```

**Error Responses:**

| Status | Condition                                 |
|--------|-------------------------------------------|
| `400`  | Invalid query parameters (e.g. bad month) |
| `401`  | Missing or invalid JWT                    |

---

### 4. `POST /api/transactions`

Create a new transaction for the authenticated user.

**🔒 Requires Authentication**

**Request Body:**

```json
{
  "amount": 45.99,
  "transaction_date": "2026-04-08",
  "description": "Grocery shopping",
  "category": "Food",
  "type": "EXPENSE"
}
```

| Field              | Type       | Required | Constraints                     |
|--------------------|------------|----------|---------------------------------|
| `amount`           | BigDecimal | Yes      | Must be > 0                     |
| `transaction_date` | String     | Yes      | ISO date format (`YYYY-MM-DD`)  |
| `description`      | String     | No       | Max 255 characters              |
| `category`         | String     | Yes      | Category name                   |
| `type`             | String     | Yes      | "EXPENSE" or "INCOME"           |

**Response — `201 Created`:**

```json
{
  "id": 3,
  "amount": 45.99,
  "date": "2026-04-08",
  "description": "Grocery shopping",
  "category": {
    "id": 2,
    "name": "Food",
    "colorHex": "#FF6B35",
    "iconName": "utensils"
  }
}
```

**Error Responses:**

| Status | Condition                                    |
|--------|----------------------------------------------|
| `400`  | Validation errors (missing fields, bad data) |
| `401`  | Missing or invalid JWT                       |
| `404`  | Category not found                           |

---

### 5. `GET /api/transactions/summary`

Retrieve a spending summary for the authenticated user, optimized for chart rendering.

**🔒 Requires Authentication**

**Query Parameters:**

| Parameter | Type   | Required | Default        | Description                                      |
|-----------|--------|----------|----------------|--------------------------------------------------|
| `month`   | String | No       | Current month  | Target month in `YYYY-MM` format                 |
| `period`  | String | No       | `monthly`      | Summary period: `weekly` or `monthly`            |

**Example Request:**

```
GET /api/transactions/summary?month=2026-04&period=weekly
```

**Response — `200 OK` (weekly period):**

```json
{
  "period": "weekly",
  "month": "2026-04",
  "totalSpent": 523.47,
  "byCategory": [
    {
      "categoryId": 2,
      "categoryName": "Food",
      "colorHex": "#FF6B35",
      "iconName": "utensils",
      "total": 189.50
    },
    {
      "categoryId": 5,
      "categoryName": "Health",
      "colorHex": "#26C485",
      "iconName": "heart-pulse",
      "total": 120.00
    },
    {
      "categoryId": 1,
      "categoryName": "Transport",
      "colorHex": "#4A90D9",
      "iconName": "car",
      "total": 213.97
    }
  ],
  "byWeek": [
    { "week": 1, "label": "Apr 1–7",  "total": 145.20 },
    { "week": 2, "label": "Apr 8–14", "total": 210.30 },
    { "week": 3, "label": "Apr 15–21","total": 98.47  },
    { "week": 4, "label": "Apr 22–28","total": 69.50  }
  ]
}
```

**Response — `200 OK` (monthly period):**

```json
{
  "period": "monthly",
  "month": "2026-04",
  "totalSpent": 523.47,
  "byCategory": [
    {
      "categoryId": 2,
      "categoryName": "Food",
      "colorHex": "#FF6B35",
      "iconName": "utensils",
      "total": 189.50
    }
  ],
  "byDay": [
    { "date": "2026-04-01", "total": 22.50 },
    { "date": "2026-04-02", "total": 0.00  },
    { "date": "2026-04-03", "total": 45.99 }
  ]
}
```

**Error Responses:**

| Status | Condition                                 |
|--------|-------------------------------------------|
| `400`  | Invalid query parameters                  |
| `401`  | Missing or invalid JWT                    |

---

### 6. `PUT /api/transactions/{id}`

Update an existing transaction for the authenticated user.

**🔒 Requires Authentication**

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id`      | Long | Yes      | Transaction ID to update |

**Request Body:**

```json
{
  "amount": 45.99,
  "transaction_date": "2026-04-08",
  "description": "Grocery shopping",
  "category": "Food",
  "type": "EXPENSE"
}
```

| Field              | Type       | Required | Constraints                     |
|--------------------|------------|----------|---------------------------------|
| `amount`           | BigDecimal | Yes      | Must be > 0                     |
| `transaction_date` | String     | Yes      | ISO date format (`YYYY-MM-DD`)  |
| `description`      | String     | No       | Max 255 characters              |
| `category`         | String     | Yes      | Category name                   |
| `type`             | String     | Yes      | "EXPENSE" or "INCOME"           |

**Response — `200 OK`:**

```json
{
  "id": 1,
  "amount": 45.99,
  "date": "2026-04-08",
  "description": "Grocery shopping",
  "category": {
    "id": 2,
    "name": "Food",
    "colorHex": "#FF6B35",
    "iconName": "utensils"
  }
}
```

**Error Responses:**

| Status | Condition                                    |
|--------|----------------------------------------------|
| `400`  | Validation errors                            |
| `401`  | Missing or invalid JWT                       |
| `403`  | Forbidden (Transaction belongs to another user) |
| `404`  | Transaction not found                        |

---

### 7. `DELETE /api/transactions/{id}`

Delete an existing transaction for the authenticated user.

**🔒 Requires Authentication**

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id`      | Long | Yes      | Transaction ID to delete |

**Response — `204 No Content`:**

Empty body.

**Error Responses:**

| Status | Condition                                    |
|--------|----------------------------------------------|
| `401`  | Missing or invalid JWT                       |
| `403`  | Forbidden (Transaction belongs to another user) |
| `404`  | Transaction not found                        |

---

## Data Models Reference

### User

| Field          | Type   | Description                     |
|----------------|--------|---------------------------------|
| `id`           | UUID   | Unique identifier               |
| `email`        | String | Unique email address            |
| `passwordHash` | String | BCrypt-hashed password (internal)|
| `role`         | String | User role (`USER`, `ADMIN`)     |

### Category

| Field      | Type   | Description                     |
|------------|--------|---------------------------------|
| `id`       | Long   | Auto-incremented ID             |
| `name`     | String | Category display name           |
| `colorHex` | String | Hex color code for charts       |
| `iconName` | String | Lucide icon identifier          |

### Expense (Transaction)

| Field         | Type       | Description                     |
|---------------|------------|---------------------------------|
| `id`          | Long       | Auto-incremented ID             |
| `amount`      | BigDecimal | Transaction amount              |
| `date`        | LocalDate  | Date of transaction             |
| `description` | String     | Optional description            |
| `category`    | Category   | Associated category             |
| `user`        | User       | Owner of the transaction        |

---

## HTTP Status Code Summary

| Code  | Meaning               | Used In                        |
|-------|-----------------------|--------------------------------|
| `200` | OK                    | GET requests, Login            |
| `201` | Created               | POST register, POST transaction|
| `400` | Bad Request           | Validation errors              |
| `401` | Unauthorized          | Invalid/missing JWT            |
| `404` | Not Found             | Resource not found             |
| `409` | Conflict              | Duplicate email                |
| `500` | Internal Server Error | Unexpected server errors       |
