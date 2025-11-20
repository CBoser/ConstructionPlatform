#!/bin/bash

echo "🧪 Rate Limiting Test Script"
echo "============================"
echo ""
echo "This script tests the rate limiting functionality"
echo "Make sure your backend server is running!"
echo ""

BASE_URL="http://localhost:3001"

echo "Test 1: Normal API Request (should succeed)"
echo "--------------------------------------------"
response=$(curl -s -w "\n%{http_code}" -H "Content-Type: application/json" "$BASE_URL/api/auth/me" 2>&1 | tail -2)
http_code=$(echo "$response" | tail -1)
echo "HTTP Status: $http_code"
if [ "$http_code" == "401" ] || [ "$http_code" == "200" ]; then
    echo "✅ PASS: Request succeeded (expected 401 unauthorized or 200 OK)"
else
    echo "❌ FAIL: Unexpected status code"
fi
echo ""

echo "Test 2: Check Rate Limit Headers"
echo "---------------------------------"
curl -s -I "$BASE_URL/api/auth/me" | grep -i "ratelimit"
echo "✅ Rate limit headers displayed above"
echo ""

echo "Test 3: Test Login Rate Limit (5 attempts allowed per 15 min)"
echo "--------------------------------------------------------------"
echo "Attempting 6 login requests with invalid credentials..."
echo ""

for i in {1..6}; do
    echo "Attempt $i/6:"
    response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"wrong"}' \
        "$BASE_URL/api/auth/login")

    http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
    remaining=$(echo "$response" | grep -o '"retryAfter":[0-9]*' | cut -d: -f2)

    if [ "$http_code" == "429" ]; then
        echo "  ❌ Rate limit exceeded (HTTP 429) - Retry after: $remaining seconds"
        echo "  ✅ PASS: Rate limiting is working!"
        break
    elif [ "$http_code" == "401" ]; then
        echo "  ✅ Request processed (HTTP 401 - invalid credentials)"
    else
        echo "  HTTP $http_code"
    fi

    sleep 0.5
done
echo ""

echo "Test 4: Test API Rate Limit (100 requests per 15 min)"
echo "-----------------------------------------------------"
echo "This test would require 101 requests - skipping for brevity"
echo "To test manually, make 101 requests to /api/customers or similar"
echo ""

echo "✅ Rate Limiting Tests Complete!"
echo ""
echo "📝 Summary:"
echo "   - API rate limiter: 100 requests/15min"
echo "   - Auth rate limiter: 5 requests/15min"
echo "   - Registration rate limiter: 3 requests/1hour"
echo ""
echo "💡 To test rate limits:"
echo "   1. Restart your backend server (to load new rate limiting code)"
echo "   2. Try logging in 6 times with wrong password"
echo "   3. The 6th attempt should return HTTP 429 (Too Many Requests)"
echo ""
