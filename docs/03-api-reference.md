# FastSchema API Reference

**Base URL:** `https://api.bipage.net`

---

## Authentication

### Login (Local)
```
POST /api/auth/local/login
Content-Type: application/json

{
  "login": "admin",
  "password": "Admin@123"
}

Response:
{
  "data": {
    "token": "eyJhbGciOi..."
  }
}
```

### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "data": {
    "id": 1,
    "name": "Admin",
    "email": "admin@bipage.net",
    "username": "admin",
    "role": "admin"
  }
}
```

---

## Schema Discovery

### List All Schemas
```
GET /api/schema
Authorization: Bearer <token>

Response:
{
  "data": [
    {
      "name": "posts",
      "label": "Posts",
      "fields": [
        { "name": "title", "type": "string" },
        { "name": "slug", "type": "string" },
        { "name": "content", "type": "text" },
        ...
      ]
    },
    ...
  ]
}
```

---

## Content CRUD

All content endpoints follow this pattern:

### List Content
```
GET /api/content/{schema}
GET /api/content/{schema}?page=1&pageSize=10
GET /api/content/{schema}?filter=title CONTAINS "hello"
GET /api/content/{schema}?sort=created_at DESC

Authorization: Bearer <token>

Response:
{
  "data": [...],
  "total": 100
}
```

### Get Single Content
```
GET /api/content/{schema}/{id}
Authorization: Bearer <token>

Response:
{
  "data": { ... }
}
```

### Create Content
```
POST /api/content/{schema}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Post",
  "slug": "new-post",
  "content": "...",
  "status": "draft"
}
```

### Update Content
```
PUT /api/content/{schema}/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Post"
}
```

### Delete Content
```
DELETE /api/content/{schema}/{id}
Authorization: Bearer <token>
```

---

## Schema Field Reference

### posts
| Field | Type | Description |
|-------|------|-------------|
| title | string | Post title |
| slug | string | URL slug |
| content | text | Post body |
| excerpt | text | Short description |
| status | string | draft/published |
| featured_image | string | Image URL |
| author_id | number | Reference to authors |
| created_at | datetime | Creation date |
| updated_at | datetime | Last update |

### products
| Field | Type | Description |
|-------|------|-------------|
| name | string | Product name |
| slug | string | URL slug |
| description | text | Product description |
| price | number | Price |
| stock | number | Stock quantity |
| status | string | active/inactive |
| images | array | Image URLs |
| created_at | datetime | Creation date |

### orders
| Field | Type | Description |
|-------|------|-------------|
| customer_name | string | Customer name |
| customer_email | string | Customer email |
| total | number | Order total |
| status | string | pending/processing/shipped/delivered |
| created_at | datetime | Order date |

### categories
| Field | Type | Description |
|-------|------|-------------|
| name | string | Category name |
| slug | string | URL slug |
| description | text | Description |
| parent_id | number | Parent category (tree) |

### tags
| Field | Type | Description |
|-------|------|-------------|
| name | string | Tag name |
| slug | string | URL slug |

### authors
| Field | Type | Description |
|-------|------|-------------|
| name | string | Author name |
| email | string | Author email |
| bio | text | Biography |
| avatar | string | Avatar URL |

### pages
| Field | Type | Description |
|-------|------|-------------|
| title | string | Page title |
| slug | string | URL slug |
| content | text | Page body |
| status | string | draft/published |
| template | string | Page template |

### banners
| Field | Type | Description |
|-------|------|-------------|
| title | string | Banner title |
| image | string | Image URL |
| link | string | Target URL |
| status | string | active/inactive |
| order | number | Display order |

### menus
| Field | Type | Description |
|-------|------|-------------|
| name | string | Menu name |
| items | array | Menu items |

### comments
| Field | Type | Description |
|-------|------|-------------|
| content | text | Comment body |
| author_name | string | Commenter name |
| author_email | string | Commenter email |
| status | string | pending/approved/rejected |
| post_id | number | Reference to posts |

### settings
| Field | Type | Description |
|-------|------|-------------|
| key | string | Setting key |
| value | string | Setting value |
| group | string | Setting group |

---

## Tool Endpoints

### Stats
```
GET /api/tool/stats
Authorization: Bearer <token>

Response:
{
  "schemas": 19,
  "users": 1,
  "roles": 3,
  "files": 578
}
```

---

## Error Responses

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

Common error codes:
- `UNAUTHORIZED` — Invalid or missing token
- `FORBIDDEN` — Insufficient permissions
- `NOT_FOUND` — Resource doesn't exist
- `VALIDATION_ERROR` — Invalid input data
- `CONFLICT` — Duplicate resource
