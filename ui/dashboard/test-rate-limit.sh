#!/usr/bin/env bash
# Test rate limiting on auth endpoint

echo "Testing Rate Limiting: /api/auth/login"
echo "Limit: 5 attempts per 15 minutes"
echo "----------------------------------------"

for i in {1..7}; do
  echo ""
  echo "Request #$i:"
  
  response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "test123"
    }')
  
  # Extract status code
  status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
  body=$(echo "$response" | sed '/HTTP_STATUS/d')
  
  echo "Status: $status"
  echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
  
  if [ "$status" = "429" ]; then
    echo ""
    echo "✅ Rate limit working! Request #$i was blocked (429 Too Many Requests)"
    exit 0
  fi
  
  sleep 0.5
done

echo ""
echo "⚠️ All 7 requests succeeded - rate limiting might not be configured"
