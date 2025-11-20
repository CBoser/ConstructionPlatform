"""
SupplyPro SPConnect API Client
Handles authentication and API calls to Hyphen SupplyPro SPConnect API v13
"""

import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import time


class SupplyProClient:
    """Client for interacting with Hyphen SupplyPro SPConnect API"""
    
    def __init__(
        self,
        oauth_uri: str,
        client_id: str,
        client_secret: str,
        base_uri: str,
        api_key: Optional[str] = None,
        auth_type: str = "oauth"
    ):
        """
        Initialize SupplyPro API client
        
        Args:
            oauth_uri: OAuth token endpoint URL
            client_id: OAuth client ID
            client_secret: OAuth client secret
            base_uri: Base API URI for orders/responses
            api_key: Optional API key if using API key authentication
            auth_type: 'oauth' or 'api_key'
        """
        self.oauth_uri = oauth_uri
        self.client_id = client_id
        self.client_secret = client_secret
        self.base_uri = base_uri
        self.api_key = api_key
        self.auth_type = auth_type
        
        self.access_token = None
        self.token_expiry = None
        
    def _get_oauth_token(self) -> str:
        """Get OAuth 2.0 access token using client credentials flow"""
        payload = {
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret
        }
        
        try:
            response = requests.post(
                self.oauth_uri,
                data=payload,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            response.raise_for_status()
            
            token_data = response.json()
            self.access_token = token_data.get("access_token")
            
            # Calculate expiry (default 3600 seconds if not provided)
            expires_in = token_data.get("expires_in", 3600)
            self.token_expiry = datetime.now() + timedelta(seconds=expires_in - 60)  # 60s buffer
            
            return self.access_token
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to obtain OAuth token: {str(e)}")
    
    def _ensure_valid_token(self):
        """Ensure we have a valid access token"""
        if self.auth_type == "api_key":
            return
            
        if not self.access_token or (self.token_expiry and datetime.now() >= self.token_expiry):
            self._get_oauth_token()
    
    def _get_headers(self) -> Dict[str, str]:
        """Get request headers with authentication"""
        if self.auth_type == "api_key":
            return {
                "x-api-key": self.api_key,
                "Content-Type": "application/json"
            }
        else:
            self._ensure_valid_token()
            return {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
    
    def send_order_response(
        self,
        builder_id: str,
        builder_account_number: str,
        order_id: int,
        response_type: str,
        po_number: Optional[str] = None,
        seller_order_number: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        response_note: Optional[str] = None,
        items: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """
        Send order response to SupplyPro
        
        Args:
            builder_id: Builder GUID from original order
            builder_account_number: Builder account number
            order_id: Order ID from original order
            response_type: Status (Accepted, AcceptedWithAmendment, Rejected, etc.)
            po_number: PO number for validation
            seller_order_number: Supplier's internal order number
            start_date: Delivery start date (ISO format)
            end_date: Delivery end date (ISO format)
            response_note: Note to attach to order
            items: List of item responses (optional)
            
        Returns:
            Response from API
        """
        endpoint = f"{self.base_uri}/inbound/v1/orderResponse"
        
        payload = {
            "header": {
                "builderId": builder_id,
                "builderAccNum": builder_account_number,
                "type": "OrderResponse",
                "responseType": response_type,
                "purpose": "Original",
                "orderId": order_id,
                "issueDate": datetime.now().isoformat()
            }
        }
        
        # Add optional fields
        if po_number:
            payload["header"]["poNumber"] = po_number
        if seller_order_number:
            payload["header"]["sellerOrderNumber"] = seller_order_number
        if start_date:
            payload["header"]["startDate"] = start_date
        if end_date:
            payload["header"]["endDate"] = end_date
        if response_note:
            payload["header"]["responseNote"] = response_note
        if items:
            payload["items"] = items
        
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to send order response: {str(e)}")
    
    def send_delivery_notice(
        self,
        order_id: int,
        builder_id: str,
        builder_account_number: str,
        notice_type: str,
        status: str,
        date_delivered: Optional[str] = None,
        date_shipped: Optional[str] = None,
        seller_order_ref: Optional[str] = None,
        note: Optional[str] = None,
        items: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """
        Send Advanced Shipment Notice (ASN) / Delivery Notice
        
        Args:
            order_id: Order ID from original order
            builder_id: Builder GUID
            builder_account_number: Builder account number  
            notice_type: 'Shipped', 'Delivered', or 'UndoComplete'
            status: 'CompleteOrder' or 'PartialOrder'
            date_delivered: Delivery date if type is 'Shipped'
            date_shipped: Ship date if type is 'Delivered' or 'UndoComplete'
            seller_order_ref: Supplier's order reference number
            note: Note to save to order
            items: List of completed items
            
        Returns:
            Response from API
        """
        endpoint = f"{self.base_uri}/inbound/v1/advanceShipmentNotice"
        
        payload = {
            "header": {
                "orderId": order_id,
                "builderId": builder_id,
                "builderAccNum": builder_account_number,
                "type": notice_type,
                "status": status,
                "issueDate": datetime.now().isoformat(),
                "purpose": "Original"
            }
        }
        
        # Add conditional required fields
        if notice_type == "Shipped" and date_delivered:
            payload["header"]["dateDelivered"] = date_delivered
        if notice_type in ["Delivered", "UndoComplete"] and date_shipped:
            payload["header"]["dateShipped"] = date_shipped
            
        # Add optional fields
        if seller_order_ref:
            payload["header"]["sellerReferenceNumber"] = seller_order_ref
        if note:
            payload["header"]["note"] = note
        if items:
            payload["items"] = items
        
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to send delivery notice: {str(e)}")
    
    def get_order_status(self, order_id: int) -> Dict[str, Any]:
        """
        Placeholder for retrieving order status
        Note: Actual endpoint depends on SupplyPro configuration
        
        Args:
            order_id: Order ID to retrieve
            
        Returns:
            Order status data
        """
        # This would need to be implemented based on actual API endpoints
        # The v13 spec primarily covers outbound orders and inbound responses
        raise NotImplementedError("Get order status endpoint not defined in v13 spec")


def create_client_from_config(config: Dict[str, Any]) -> SupplyProClient:
    """
    Create SupplyPro client from configuration dictionary
    
    Args:
        config: Dictionary with keys:
            - auth_type: 'oauth' or 'api_key'
            - oauth_uri: OAuth endpoint (if oauth)
            - client_id: OAuth client ID (if oauth)
            - client_secret: OAuth client secret (if oauth)
            - api_key: API key value (if api_key)
            - base_uri: Base API URI
            
    Returns:
        Configured SupplyProClient instance
    """
    auth_type = config.get("auth_type", "oauth")
    
    if auth_type == "oauth":
        return SupplyProClient(
            oauth_uri=config["oauth_uri"],
            client_id=config["client_id"],
            client_secret=config["client_secret"],
            base_uri=config["base_uri"],
            auth_type="oauth"
        )
    else:
        return SupplyProClient(
            oauth_uri="",
            client_id="",
            client_secret="",
            base_uri=config["base_uri"],
            api_key=config["api_key"],
            auth_type="api_key"
        )


# Example usage
if __name__ == "__main__":
    # OAuth example
    client = SupplyProClient(
        oauth_uri="https://apiauth02.hyphensolutions.io/tokens",
        client_id="your-client-id",
        client_secret="your-client-secret",
        base_uri="https://api-sp.hyphensolutions.com"
    )
    
    # Send order acceptance
    response = client.send_order_response(
        builder_id="builder-guid-here",
        builder_account_number="12345",
        order_id=98765,
        response_type="Accepted",
        seller_order_number="SO-2024-001",
        start_date="2024-11-20T08:00:00",
        end_date="2024-11-20T17:00:00",
        response_note="Order accepted for delivery"
    )
    
    print(json.dumps(response, indent=2))
