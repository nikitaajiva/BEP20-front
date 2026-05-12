#!/bin/bash

# Configuration
USERNAME="admin"
PASSWORD="123456"
URL="http://localhost:5001/api/auth/login"

echo "Attempting to login to $URL..."

RESPONSE=$(curl -s -X POST "$URL" \
     -H "Content-Type: application/json" \
     -d "{\"email\":\"$USERNAME\", \"password\":\"$PASSWORD\"}")

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "Login Successful!"
    echo "Token: ${TOKEN:0:20}..."
else
    echo "Login Failed!"
    echo "Response: $RESPONSE"
fi
