# 👤 User Management REST API

A clean, minimal REST API built with **Node.js + Express** using **in-memory storage**.

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# Or for auto-reload during development
npm run dev
```

Server runs at: `http://localhost:3000`

---

## 📡 Endpoints

### `GET /users`
List all users. Supports optional filters:

| Query Param | Example              | Description                        |
|-------------|----------------------|------------------------------------|
| `search`    | `?search=alice`      | Filter by name, email, or role     |
| `sort`      | `?sort=name`         | Sort by: `name`, `email`, `role`, `createdAt` |
| `order`     | `?order=desc`        | `asc` (default) or `desc`          |

```bash
# All users
curl http://localhost:3000/users

# Search
curl "http://localhost:3000/users?search=alice"

# Sort by name descending
curl "http://localhost:3000/users?sort=name&order=desc"
```

---

### `GET /users/:id`
Get a specific user by their ID.

```bash
curl http://localhost:3000/users/<id>
```

---

### `POST /users`
Create a new user.

**Required fields:** `name`, `email`  
**Optional fields:** `role` (defaults to `"viewer"`)

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "email": "jane@example.com", "role": "editor"}'
```

---

### `PUT /users/:id`
Update an existing user. All fields are optional (partial update supported).

```bash
curl -X PUT http://localhost:3000/users/<id> \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

---

### `DELETE /users/:id`
Delete a user by ID.

```bash
curl -X DELETE http://localhost:3000/users/<id>
```

---

## 📦 User Object

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "role": "admin",
  "createdAt": "2024-01-10T00:00:00.000Z",
  "updatedAt": "2024-06-01T12:00:00.000Z"   // only present after an update
}
```

---

## ⚠️ Error Responses

All errors follow this shape:

```json
{ "error": "Description of what went wrong" }
```

| Status | Meaning                        |
|--------|--------------------------------|
| `400`  | Validation error               |
| `404`  | User not found                 |
| `409`  | Email already exists           |

---

## 🗂️ Project Structure

```
user-management-api/
├── server.js      # All routes and logic
├── package.json   
└── README.md      
```

> **Note:** Data is stored in-memory and resets on every server restart. To persist data, swap the `users` array for a SQLite database or a JSON file.