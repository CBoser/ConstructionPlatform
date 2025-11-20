# SupplyPro SPConnect API Reference

## API Endpoints

### Base URLs
- **Production**: `https://api-sp.hyphensolutions.com`
- **UAT/Testing**: `https://api-sp-uat.hyphensolutions.com`

## Authentication

### OAuth 2.0 (Recommended)

**Token Endpoint**: Provider-specific OAuth URI

**Request**:
```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&
client_id=YOUR_CLIENT_ID&
client_secret=YOUR_CLIENT_SECRET
```

**Response**:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Usage**:
```http
Authorization: Bearer eyJhbGc...
```

### API Key Authentication

**Header**:
```http
x-api-key: YOUR_API_KEY
```

## Inbound Endpoints (Sending TO SupplyPro)

### 1. Order Response
**Endpoint**: `/inbound/v1/orderResponse`  
**Method**: POST  
**Purpose**: Respond to orders received from BuildPro/SupplyPro

**Payload Structure**:
```json
{
  "header": {
    "builderId": "builder-guid",
    "builderAccNum": "12345",
    "type": "OrderResponse",
    "responseType": "Accepted",
    "purpose": "Original",
    "orderId": 98765,
    "poNumber": "PO-2024-001",
    "sellerOrderNumber": "SO-2024-001",
    "startDate": "2024-11-20T08:00:00",
    "endDate": "2024-11-20T17:00:00",
    "issueDate": "2024-11-15T10:00:00",
    "responseNote": "Order accepted for delivery"
  },
  "items": [
    {
      "itemResponse": "ItemAccepted",
      "lineNumber": 1,
      "supplierSKU": "LMB-2X4-8",
      "quantityAccepted": 100
    }
  ]
}
```

**Response Types**:
- `Accepted` - Order fully accepted
- `AcceptedWithAmendment` - Accepted with changes
- `Rejected` - Order rejected
- `RejectedDuplicate` - Duplicate order
- `RejectedNoDetail` - Missing details
- `RejectedResubmitWithCorrections` - Needs corrections
- `Pending` - Still processing

### 2. Advanced Shipment Notice (ASN)
**Endpoint**: `/inbound/v1/advanceShipmentNotice`  
**Method**: POST  
**Purpose**: Notify BuildPro of shipment/delivery

**Payload Structure**:
```json
{
  "header": {
    "orderId": 98765,
    "builderId": "builder-guid",
    "builderAccNum": "12345",
    "type": "Delivered",
    "status": "CompleteOrder",
    "issueDate": "2024-11-20T14:00:00",
    "dateShipped": "2024-11-20T08:00:00",
    "sellerReferenceNumber": "SHIP-2024-001",
    "note": "Delivered to job site"
  },
  "items": [
    {
      "lineNumber": 1,
      "quantityDelivered": 100,
      "supplierSKU": "LMB-2X4-8"
    }
  ]
}
```

## Common Response Types
- `Accepted`, `AcceptedWithAmendment`, `Rejected`, `Pending`

## Error Handling
- `401` - Authentication failed
- `400` - Invalid request payload  
- `404` - Order not found
- `500` - Server error
