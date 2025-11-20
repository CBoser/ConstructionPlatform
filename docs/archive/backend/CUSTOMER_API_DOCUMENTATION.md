# Customer API Documentation

Complete RESTful API documentation for Customer management endpoints.

## Base URL

```
http://localhost:3001/api/customers
```

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Authorization

- **Read operations** (GET): All authenticated users
- **Write operations** (POST, PUT, DELETE): ADMIN and ESTIMATOR roles only
- **Delete operations**: ADMIN role only

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., customer has dependencies)
- `500` - Internal Server Error

---

## Customer Endpoints

### 1. Get All Customers

Get a paginated list of customers with optional filtering.

**Endpoint:** `GET /api/customers`

**Auth:** Required (All roles)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 50 | Items per page (max 100) |
| search | string | - | Search by customer name or notes |
| customerType | string | - | Filter by type (PRODUCTION, SEMI_CUSTOM, FULL_CUSTOM) |
| isActive | boolean | - | Filter by active status |

**Example Request:**
```bash
curl http://localhost:3001/api/customers?page=1&limit=10&customerType=PRODUCTION&isActive=true \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "customerName": "Richmond American Homes",
      "customerType": "PRODUCTION",
      "pricingTier": "TIER_1",
      "primaryContactId": "uuid",
      "isActive": true,
      "notes": "Large production builder",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 2. Get Customer by ID

Get a single customer with all related data (contacts, pricing tiers, external IDs).

**Endpoint:** `GET /api/customers/:id`

**Auth:** Required (All roles)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Customer ID |

**Example Request:**
```bash
curl http://localhost:3001/api/customers/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "customerName": "Richmond American Homes",
    "customerType": "PRODUCTION",
    "pricingTier": "TIER_1",
    "primaryContactId": "contact-uuid",
    "isActive": true,
    "notes": "Large production builder - Premium tier pricing",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z",
    "contacts": [
      {
        "id": "contact-uuid",
        "customerId": "uuid",
        "contactName": "Sarah Johnson",
        "role": "Project Manager",
        "email": "sjohnson@richmondamerican.com",
        "phone": "(555) 123-4567",
        "receivesNotifications": true,
        "isPrimary": true,
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ],
    "pricingTiers": [
      {
        "id": "tier-uuid",
        "customerId": "uuid",
        "tierName": "TIER_1",
        "discountPercentage": 15.00,
        "effectiveDate": "2025-01-01T00:00:00Z",
        "expirationDate": "2025-12-31T23:59:59Z",
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ],
    "externalIds": [
      {
        "id": "ext-uuid",
        "customerId": "uuid",
        "externalSystem": "SALES_1440",
        "externalCustomerId": "RICH-001",
        "externalCustomerName": "Richmond American",
        "isPrimary": true,
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ]
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Customer not found: 123e4567-e89b-12d3-a456-426614174000"
}
```

---

### 3. Create Customer

Create a new customer.

**Endpoint:** `POST /api/customers`

**Auth:** Required (ADMIN, ESTIMATOR)

**Request Body:**
```json
{
  "customerName": "Test Builder Inc",
  "customerType": "PRODUCTION",
  "pricingTier": "TIER_2",
  "notes": "Production builder - standard pricing"
}
```

**Required Fields:**
- `customerName` (string, 1-255 chars)
- `customerType` (enum: PRODUCTION, SEMI_CUSTOM, FULL_CUSTOM)

**Optional Fields:**
- `pricingTier` (string)
- `notes` (string)

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/customers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Builder Inc",
    "customerType": "PRODUCTION",
    "pricingTier": "TIER_2",
    "notes": "Production builder"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "customerName": "Test Builder Inc",
    "customerType": "PRODUCTION",
    "pricingTier": "TIER_2",
    "primaryContactId": null,
    "isActive": true,
    "notes": "Production builder",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z",
    "contacts": [],
    "pricingTiers": [],
    "externalIds": []
  },
  "message": "Customer created successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "customerName",
      "message": "Customer name is required"
    }
  ]
}
```

---

### 4. Update Customer

Update an existing customer.

**Endpoint:** `PUT /api/customers/:id`

**Auth:** Required (ADMIN, ESTIMATOR)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Customer ID |

**Request Body (all fields optional):**
```json
{
  "customerName": "Updated Name",
  "customerType": "SEMI_CUSTOM",
  "pricingTier": "TIER_1",
  "primaryContactId": "contact-uuid",
  "isActive": false,
  "notes": "Updated notes"
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:3001/api/customers/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Updated Builder Name",
    "isActive": true
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Customer updated successfully"
}
```

---

### 5. Delete Customer

Delete a customer (soft delete by default, sets isActive = false).

**Endpoint:** `DELETE /api/customers/:id`

**Auth:** Required (ADMIN only)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Customer ID |

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| hard | boolean | false | If true, permanently delete |

**Example Request (Soft Delete):**
```bash
curl -X DELETE http://localhost:3001/api/customers/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Request (Hard Delete):**
```bash
curl -X DELETE "http://localhost:3001/api/customers/123e4567-e89b-12d3-a456-426614174000?hard=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Customer deactivated successfully"
}
```

**Error Response (409):**
```json
{
  "success": false,
  "error": "Cannot delete customer 123e4567. Has dependencies: 5 job(s)"
}
```

---

## Contact Endpoints

### 6. Get Customer Contacts

Get all contacts for a customer.

**Endpoint:** `GET /api/customers/:id/contacts`

**Auth:** Required (All roles)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "contact-uuid",
      "customerId": "customer-uuid",
      "contactName": "John Doe",
      "role": "Project Manager",
      "email": "john@example.com",
      "phone": "(555) 123-4567",
      "receivesNotifications": true,
      "isPrimary": true,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

### 7. Add Customer Contact

Add a new contact to a customer.

**Endpoint:** `POST /api/customers/:id/contacts`

**Auth:** Required (ADMIN, ESTIMATOR)

**Request Body:**
```json
{
  "contactName": "Jane Smith",
  "role": "Owner",
  "email": "jane@testbuilder.com",
  "phone": "(555) 987-6543",
  "receivesNotifications": true,
  "isPrimary": false
}
```

**Required Fields:**
- `contactName` (string, 1-255 chars)

**Optional Fields:**
- `role` (string, max 100 chars)
- `email` (string, valid email format)
- `phone` (string, max 50 chars)
- `receivesNotifications` (boolean, default: true)
- `isPrimary` (boolean, default: false)

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/customers/123e4567/contacts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contactName": "Jane Smith",
    "role": "Owner",
    "email": "jane@testbuilder.com",
    "phone": "(555) 987-6543",
    "isPrimary": true
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "new-contact-uuid",
    "customerId": "customer-uuid",
    "contactName": "Jane Smith",
    "role": "Owner",
    "email": "jane@testbuilder.com",
    "phone": "(555) 987-6543",
    "receivesNotifications": true,
    "isPrimary": true,
    "createdAt": "2025-01-15T10:00:00Z"
  },
  "message": "Contact added successfully"
}
```

---

### 8. Update Customer Contact

Update an existing contact.

**Endpoint:** `PUT /api/customers/:id/contacts/:contactId`

**Auth:** Required (ADMIN, ESTIMATOR)

**Request Body (all fields optional):**
```json
{
  "contactName": "Updated Name",
  "role": "New Role",
  "email": "newemail@example.com",
  "phone": "(555) 111-2222",
  "receivesNotifications": false,
  "isPrimary": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Contact updated successfully"
}
```

---

### 9. Delete Customer Contact

Delete a contact.

**Endpoint:** `DELETE /api/customers/:id/contacts/:contactId`

**Auth:** Required (ADMIN, ESTIMATOR)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

---

## Pricing Tier Endpoints

### 10. Get Customer Pricing Tiers

Get all pricing tiers for a customer.

**Endpoint:** `GET /api/customers/:id/pricing-tiers`

**Auth:** Required (All roles)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "tier-uuid",
      "customerId": "customer-uuid",
      "tierName": "TIER_1",
      "discountPercentage": 15.00,
      "effectiveDate": "2025-01-01T00:00:00Z",
      "expirationDate": "2025-12-31T23:59:59Z",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

### 11. Add Pricing Tier

Add a pricing tier to a customer.

**Endpoint:** `POST /api/customers/:id/pricing-tiers`

**Auth:** Required (ADMIN, ESTIMATOR)

**Request Body:**
```json
{
  "tierName": "TIER_1",
  "discountPercentage": 15.0,
  "effectiveDate": "2025-01-01",
  "expirationDate": "2025-12-31"
}
```

**Required Fields:**
- `tierName` (string, 1-100 chars)
- `discountPercentage` (number, 0-100)
- `effectiveDate` (ISO date string)

**Optional Fields:**
- `expirationDate` (ISO date string, must be after effectiveDate)

**Success Response (201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Pricing tier added successfully"
}
```

---

### 12. Get Current Pricing Tier

Get the currently active pricing tier for a customer (effective today).

**Endpoint:** `GET /api/customers/:id/current-pricing`

**Auth:** Required (All roles)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "tier-uuid",
    "customerId": "customer-uuid",
    "tierName": "TIER_1",
    "discountPercentage": 15.00,
    "effectiveDate": "2025-01-01T00:00:00Z",
    "expirationDate": "2025-12-31T23:59:59Z",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

**Success Response (200) - No Active Tier:**
```json
{
  "success": true,
  "data": null
}
```

---

### 13. Update Pricing Tier

Update a pricing tier.

**Endpoint:** `PUT /api/customers/:id/pricing-tiers/:tierId`

**Auth:** Required (ADMIN, ESTIMATOR)

---

### 14. Delete Pricing Tier

Delete a pricing tier.

**Endpoint:** `DELETE /api/customers/:id/pricing-tiers/:tierId`

**Auth:** Required (ADMIN, ESTIMATOR)

---

## External ID Endpoints

### 15. Get Customer External IDs

Get all external system mappings for a customer.

**Endpoint:** `GET /api/customers/:id/external-ids`

**Auth:** Required (All roles)

---

### 16. Add External ID

Map a customer to an external system.

**Endpoint:** `POST /api/customers/:id/external-ids`

**Auth:** Required (ADMIN, ESTIMATOR)

**Request Body:**
```json
{
  "externalSystem": "SALES_1440",
  "externalCustomerId": "CUST-001",
  "externalCustomerName": "Customer Name in External System",
  "isPrimary": true
}
```

**Required Fields:**
- `externalSystem` (string, 1-100 chars)
- `externalCustomerId` (string, 1-255 chars)

**Success Response (201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "External ID mapped successfully"
}
```

---

### 17. Update External ID

Update an external ID mapping.

**Endpoint:** `PUT /api/customers/:id/external-ids/:externalIdId`

**Auth:** Required (ADMIN, ESTIMATOR)

---

### 18. Delete External ID

Delete an external ID mapping.

**Endpoint:** `DELETE /api/customers/:id/external-ids/:externalIdId`

**Auth:** Required (ADMIN, ESTIMATOR)

---

### 19. Find Customer by External ID

Find a customer by their external system ID.

**Endpoint:** `GET /api/customers/external/:system/:externalId`

**Auth:** Required (All roles)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| system | string | External system name (e.g., SALES_1440) |
| externalId | string | External customer ID |

**Example Request:**
```bash
curl http://localhost:3001/api/customers/external/SALES_1440/RICH-001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    // Full customer object with all relations
  }
}
```

---

## Testing with cURL

### Complete Example Workflow

```bash
# 1. Login to get JWT token
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mindflow.com","password":"password"}' \
  | jq -r '.token')

# 2. Create a customer
CUSTOMER=$(curl -X POST http://localhost:3001/api/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Builder Inc",
    "customerType": "PRODUCTION",
    "pricingTier": "TIER_2"
  }')

CUSTOMER_ID=$(echo $CUSTOMER | jq -r '.data.id')

# 3. Add a contact
curl -X POST "http://localhost:3001/api/customers/$CUSTOMER_ID/contacts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contactName": "John Smith",
    "role": "Project Manager",
    "email": "john@testbuilder.com",
    "phone": "(555) 123-4567",
    "isPrimary": true
  }'

# 4. Add a pricing tier
curl -X POST "http://localhost:3001/api/customers/$CUSTOMER_ID/pricing-tiers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tierName": "TIER_2",
    "discountPercentage": 10.0,
    "effectiveDate": "2025-01-01",
    "expirationDate": "2025-12-31"
  }'

# 5. Get current pricing tier
curl "http://localhost:3001/api/customers/$CUSTOMER_ID/current-pricing" \
  -H "Authorization: Bearer $TOKEN"

# 6. List all customers
curl "http://localhost:3001/api/customers?customerType=PRODUCTION&isActive=true" \
  -H "Authorization: Bearer $TOKEN"

# 7. Get customer by ID
curl "http://localhost:3001/api/customers/$CUSTOMER_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Postman Collection

Import the following collection into Postman:

[Collection JSON would go here]

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

### Common Errors

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "customerName",
      "message": "Customer name is required"
    }
  ]
}
```

**Unauthorized (401):**
```json
{
  "success": false,
  "error": "Unauthorized - Invalid or missing token"
}
```

**Forbidden (403):**
```json
{
  "success": false,
  "error": "Forbidden - Insufficient permissions"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": "Customer not found: 123e4567-e89b-12d3-a456-426614174000"
}
```

**Conflict (409):**
```json
{
  "success": false,
  "error": "Cannot delete customer 123e4567. Has dependencies: 5 job(s)"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. This will be added in a future update.

---

## Support

For issues or questions, contact the development team or create an issue in the GitHub repository.
