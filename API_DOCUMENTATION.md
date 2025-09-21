# Sampark API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All API endpoints (except login and reset-admin-password) require JWT authentication via Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 1. Authentication APIs

### 1.1 Login
**POST** `/login`

**Description:** Authenticate user and get JWT token

**Request Body:**
```json
{
  "user_name": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "ADMIN",
  "region_id": null
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"user_name":"admin","password":"admin123"}'
```

### 1.2 Get Current User Info
**GET** `/users/me`

**Description:** Get current authenticated user details

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "user_id": 1,
  "user_name": "admin",
  "role": "ADMIN",
  "region_id": null,
  "is_active": 1,
  "created_at": "2025-09-20T19:56:04.000Z",
  "updated_at": "2025-09-20T19:57:08.000Z"
}
```

### 1.3 Get All Regions
**GET** `/regions`

**Description:** Get all available regions

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
[
  {
    "region_id": 1,
    "name": "हरियाणा",
    "code": "HR",
    "type": "PRANT",
    "parent_id": null,
    "created_at": "2025-09-20T19:56:04.000Z",
    "updated_at": "2025-09-20T19:56:04.000Z"
  },
  {
    "region_id": 4,
    "name": "गुरुग्राम नगर",
    "code": "GGM_NG",
    "type": "NAGAR",
    "parent_id": 2,
    "created_at": "2025-09-20T19:56:04.000Z",
    "updated_at": "2025-09-20T19:56:04.000Z"
  }
]
```

---

## 2. Toli Management APIs

### 2.1 Create Toli
**POST** `/toli`

**Description:** Create a new toli (team)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "गुरुग्राम टोली 1",
  "type": "NAGAR",
  "region_id": 4,
  "toli_user_id": null,
  "pramukh": {
    "name": "राम कुमार",
    "mobile": "9811111111"
  },
  "members": [
    {
      "name": "सीता देवी",
      "mobile": "9812222222"
    },
    {
      "name": "हरी ओम",
      "mobile": "9813333333"
    }
  ]
}
```

**Response:**
```json
{
  "toli_id": 1,
  "status": "created"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/toli \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "name": "गुरुग्राम टोली 1",
    "type": "NAGAR",
    "region_id": 4,
    "pramukh": {
      "name": "राम कुमार",
      "mobile": "9811111111"
    },
    "members": [
      {"name": "सीता देवी", "mobile": "9812222222"},
      {"name": "हरी ओम", "mobile": "9813333333"}
    ]
  }'
```

### 2.2 Get All Tolis
**GET** `/toli`

**Description:** Get all tolis with optional filtering

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `region_id` (optional): Filter by region ID
- `type` (optional): Filter by toli type
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
[
  {
    "toli_id": 1,
    "name": "गुरुग्राम टोली 1",
    "type": "NAGAR",
    "region_id": 4,
    "toli_user_id": null,
    "pramukh_json": {
      "name": "राम कुमार",
      "mobile": "9811111111"
    },
    "members_json": [
      {
        "name": "सीता देवी",
        "mobile": "9812222222"
      },
      {
        "name": "हरी ओम",
        "mobile": "9813333333"
      }
    ],
    "created_at": "2025-09-20T19:56:04.000Z",
    "updated_at": "2025-09-20T19:56:04.000Z"
  }
]
```

---

## 3. Person Management APIs

### 3.1 Create Person
**POST** `/person`

**Description:** Create a new person record

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "राम कुमार",
  "phone_number": "9811111111",
  "email": "ram@example.com",
  "sex": "MALE",
  "address_text": "गुरुग्राम, हरियाणा",
  "region_id": 4,
  "visheshta": "सामाजिक कार्यकर्ता",
  "answers": {
    "age": "35",
    "occupation": "व्यापारी"
  }
}
```

**Field Details:**
- `name` (required): Person's name
- `phone_number` (optional): Phone number
- `email` (optional): Email address
- `sex` (required): One of "MALE", "FEMALE", "OTHER", "UNSPECIFIED"
- `address_text` (optional): Address description
- `region_id` (optional): Region ID
- `visheshta` (optional): Special characteristics
- `answers` (optional): JSON object with custom answers

**Response:**
```json
{
  "person_id": 1,
  "status": "created"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/person \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "name": "राम कुमार",
    "phone_number": "9811111111",
    "email": "ram@example.com",
    "sex": "MALE",
    "address_text": "गुरुग्राम, हरियाणा",
    "region_id": 4,
    "visheshta": "सामाजिक कार्यकर्ता",
    "answers": {
      "age": "35",
      "occupation": "व्यापारी"
    }
  }'
```

### 3.2 Get All Persons
**GET** `/person`

**Description:** Get all persons with optional filtering

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `region_id` (optional): Filter by region ID
- `search` (optional): Search by name
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
[
  {
    "person_id": 1,
    "name": "राम कुमार",
    "phone_number": "9811111111",
    "email": "ram@example.com",
    "sex": "MALE",
    "address_text": "गुरुग्राम, हरियाणा",
    "region_id": 4,
    "created_by": 1,
    "visheshta": "सामाजिक कार्यकर्ता",
    "answers_json": {
      "age": "35",
      "occupation": "व्यापारी"
    },
    "created_at": "2025-09-20T19:56:04.000Z",
    "updated_at": "2025-09-20T19:56:04.000Z"
  }
]
```

---

## 4. Visit Management APIs

### 4.1 Create Visit
**POST** `/visit`

**Description:** Create a new visit record (main data collection)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "person_name": "राम कुमार",
  "person_phone": "9811111111",
  "person_email": "ram@example.com",
  "person_sex": "MALE",
  "toli_id": 1,
  "region_id": 4,
  "visited_at": "2025-01-20T10:00:00Z",
  "total_members": 4,
  "male_count": 2,
  "female_count": 2,
  "kids_count": 0,
  "nishulk_sticker": 1,
  "nishulk_folder": 1,
  "nishulk_books": 2,
  "shashulk_pushtak": 1,
  "address_text": "गुरुग्राम, हरियाणा",
  "notes": "सफल भेंट"
}
```

**Field Details:**
- `person_name` (required): Person's name for this visit
- `person_phone` (optional): Person's phone number
- `person_email` (optional): Person's email
- `person_sex` (required): One of "MALE", "FEMALE", "OTHER", "UNSPECIFIED"
- `toli_id` (optional): Associated toli ID
- `region_id` (optional): Region ID
- `visited_at` (optional): Visit timestamp (ISO format)
- `total_members` (required): Total household members
- `male_count` (required): Number of male members
- `female_count` (required): Number of female members
- `kids_count` (required): Number of children
- `nishulk_sticker` (required): Number of free stickers distributed
- `nishulk_folder` (required): Number of free folders distributed
- `nishulk_books` (required): Number of free books distributed
- `shashulk_pushtak` (required): Number of paid books distributed
- `address_text` (optional): Visit address
- `notes` (optional): Additional notes

**Response:**
```json
{
  "visit_id": 1,
  "status": "created"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/visit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "person_name": "राम कुमार",
    "person_phone": "9811111111",
    "person_email": "ram@example.com",
    "person_sex": "MALE",
    "toli_id": 1,
    "region_id": 4,
    "visited_at": "2025-01-20T10:00:00Z",
    "total_members": 4,
    "male_count": 2,
    "female_count": 2,
    "kids_count": 0,
    "nishulk_sticker": 1,
    "nishulk_folder": 1,
    "nishulk_books": 2,
    "shashulk_pushtak": 1,
    "address_text": "गुरुग्राम, हरियाणा",
    "notes": "सफल भेंट"
  }'
```

### 4.2 Get All Visits
**GET** `/visit`

**Description:** Get all visits with optional filtering

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `region_id` (optional): Filter by region ID
- `toli_id` (optional): Filter by toli ID
- `user_id` (optional): Filter by user ID
- `start_date` (optional): Filter by start date (ISO format)
- `end_date` (optional): Filter by end date (ISO format)
- `search` (optional): Search by person name
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
[
  {
    "visit_id": 1,
    "person_name": "राम कुमार",
    "person_phone": "9811111111",
    "person_email": "ram@example.com",
    "person_sex": "MALE",
    "toli_id": 1,
    "region_id": 4,
    "visited_at": "2025-01-20T10:00:00.000Z",
    "created_by": 1,
    "total_members": 4,
    "male_count": 2,
    "female_count": 2,
    "kids_count": 0,
    "nishulk_sticker": 1,
    "nishulk_folder": 1,
    "nishulk_books": 2,
    "shashulk_pushtak": 1,
    "address_text": "गुरुग्राम, हरियाणा",
    "notes": "सफल भेंट",
    "created_at": "2025-09-20T19:56:04.000Z"
  }
]
```

---

## 5. Error Responses

All APIs return consistent error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid region ID"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid username or password"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Cannot create toli outside your assigned region"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "User not found"
}
```

### 409 Conflict
```json
{
  "error": "Conflict",
  "message": "Username already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Person creation failed",
  "details": "Bind parameters must not contain undefined"
}
```

---

## 6. User Roles and Permissions

### Role Hierarchy:
1. **ADMIN** - Full access to all resources
2. **PRANT_KARYAKARTA** - Access to prant-level data
3. **VIBHAG_KARYAKARTA** - Access to vibhag-level data
4. **JILA_KARYAKARTA** - Access to jila-level data
5. **NAGAR_KARYAKARTA** - Access to nagar-level data

### Access Control:
- Users can only access data within their assigned region
- Admin users can access all regions
- Non-admin users cannot create resources outside their region

---

## 7. Data Types

### Region Types:
- `PRANT` - State level
- `VIBHAG` - Division level
- `JILA` - District level
- `NAGAR` - City level
- `KHAND` - Ward level

### Sex Types:
- `MALE`
- `FEMALE`
- `OTHER`
- `UNSPECIFIED`

### Toli Types:
- `PRANT`
- `VIBHAG`
- `JILA`
- `NAGAR`
- `KHAND`

---

## 8. Testing Credentials

### Admin User:
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** `ADMIN`

### Test Users:
- **Prant User:** `prant_user` / `prant123`
- **Vibhag User:** `vibhag_user` / `vibhag123`
- **Jila User:** `jila_user` / `jila123`
- **Nagar User:** `nagar_user` / `nagar123`

---

## 9. Integration Notes

1. **JWT Token Expiry:** 30 days
2. **Content-Type:** Always use `application/json`
3. **Character Encoding:** UTF-8 (supports Hindi and other Indian languages)
4. **Date Format:** ISO 8601 (e.g., "2025-01-20T10:00:00Z")
5. **Pagination:** Use `limit` and `offset` parameters
6. **Error Handling:** Check HTTP status codes and error messages
7. **Authentication:** Include JWT token in Authorization header for all protected endpoints

---

## 10. Quick Start Example

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:3000/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_name: 'admin',
    password: 'admin123'
  })
});

const { token } = await loginResponse.json();

// 2. Create a visit
const visitResponse = await fetch('http://localhost:3000/api/visit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    person_name: 'राम कुमार',
    person_phone: '9811111111',
    person_sex: 'MALE',
    total_members: 4,
    male_count: 2,
    female_count: 2,
    kids_count: 0,
    nishulk_sticker: 1,
    nishulk_folder: 1,
    nishulk_books: 2,
    shashulk_pushtak: 1,
    notes: 'सफल भेंट'
  })
});

const visitResult = await visitResponse.json();
console.log('Visit created:', visitResult);
```

---

**For any questions or issues, please contact the backend team.**
