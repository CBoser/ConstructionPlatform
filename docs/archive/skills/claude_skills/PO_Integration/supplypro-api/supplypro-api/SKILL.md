---
name: supplypro-api
description: Integration with Hyphen SupplyPro SPConnect API v13 for construction supply order management. Use when working with SupplyPro orders, BuildPro integration, sending order responses, delivery notifications (ASN), handling OAuth authentication, or automating construction material order workflows. Supports order acceptance/rejection, shipment tracking, and two-way ERP integration.
---

# SupplyPro SPConnect API Integration

Interact with Hyphen SupplyPro's SPConnect API v13 for automated construction supply order management.

## Quick Start

Use the `supplypro_client.py` script for all API interactions:

```python
from scripts.supplypro_client import SupplyProClient

# Initialize with OAuth
client = SupplyProClient(
    oauth_uri="https://apiauth02.hyphensolutions.io/tokens",
    client_id="your-client-id",
    client_secret="your-client-secret",
    base_uri="https://api-sp.hyphensolutions.com"
)

# Accept an order
response = client.send_order_response(
    builder_id="builder-guid",
    builder_account_number="12345",
    order_id=98765,
    response_type="Accepted",
    seller_order_number="SO-2024-001"
)
```

## Authentication

Two methods supported:

**OAuth 2.0 (Recommended)**:
- Token valid for 3600 seconds
- Automatically refreshes when expired
- Use for production systems

**API Key**:
- Simpler but less secure
- Good for testing/development
- Include in `x-api-key` header

See `references/api_docs.md` for authentication details.

## Common Operations

### 1. Accept an Order

```python
client.send_order_response(
    builder_id="builder-guid",
    builder_account_number="12345",
    order_id=98765,
    response_type="Accepted",
    seller_order_number="SO-2024-001",
    start_date="2024-11-20T08:00:00",
    end_date="2024-11-20T17:00:00"
)
```

### 2. Send Delivery Notification

```python
client.send_delivery_notice(
    order_id=98765,
    builder_id="builder-guid",
    builder_account_number="12345",
    notice_type="Delivered",
    status="CompleteOrder",
    date_shipped="2024-11-20T08:00:00",
    note="Delivered to job site"
)
```

### 3. Reject an Order

```python
client.send_order_response(
    builder_id="builder-guid",
    builder_account_number="12345",
    order_id=98765,
    response_type="Rejected",
    response_note="Insufficient inventory"
)
```

## Response Types

**Order Responses**:
- `Accepted` - Order fully accepted
- `AcceptedWithAmendment` - Accepted with changes
- `Rejected` - Order rejected
- `Pending` - Still processing

**Delivery Types**:
- `Shipped` - Items have shipped
- `Delivered` - Items delivered to site
- `UndoComplete` - Reverse a completion

**Delivery Status**:
- `CompleteOrder` - Full delivery
- `PartialOrder` - Partial delivery

## Important Notes

**Date Formats**: Always use ISO 8601 format:
```
2024-11-20T08:00:00
```

**Case Sensitivity**: Enum values are case-sensitive. Use exact values:
- ✅ `Accepted`
- ❌ `accepted`

**Token Management**: OAuth tokens auto-refresh 60 seconds before expiry.

**Error Handling**: The client raises exceptions on API errors. Wrap calls in try-except:

```python
try:
    response = client.send_order_response(...)
except Exception as e:
    print(f"API error: {str(e)}")
```

## Integration with Azure/Power BI

For automated workflows:

1. Store credentials in Azure Key Vault
2. Use Azure Functions to handle webhooks from SupplyPro
3. Send responses back via this API
4. Log all transactions to Azure Data Lake
5. Visualize in Power BI

## Testing

Use UAT environment for testing:
```python
client = SupplyProClient(
    ...
    base_uri="https://api-sp-uat.hyphensolutions.com"
)
```

## Troubleshooting

**401 Unauthorized**: Check OAuth credentials or API key

**400 Bad Request**: Validate payload structure against `references/api_docs.md`

**Missing Required Fields**: Review API documentation for required vs. optional fields

## Additional Resources

- **API Docs**: `references/api_docs.md` - Full API reference
- **Client Script**: `scripts/supplypro_client.py` - Python client implementation
