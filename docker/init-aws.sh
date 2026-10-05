#!/bin/bash

set -e

REGION="us-east-1"
ENDPOINT="http://localhost:4566"

echo "======================================"
echo "Initializing LocalStack AWS resources"
echo "======================================"

# ============================================================
# DynamoDB - VMs
# ============================================================

echo ""
echo "Creating DynamoDB table: vms..."

if aws dynamodb describe-table \
    --table-name vms \
    --region "$REGION" \
    --endpoint-url "$ENDPOINT" >/dev/null 2>&1; then

    echo "DynamoDB table 'vms' already exists."

else

    if aws dynamodb create-table \
        --table-name vms \
        --attribute-definitions \
            AttributeName=id,AttributeType=S \
        --key-schema \
            AttributeName=id,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region "$REGION" \
        --endpoint-url "$ENDPOINT" >/dev/null; then
        echo "DynamoDB table 'vms' created."
    elif aws dynamodb describe-table \
        --table-name vms \
        --region "$REGION" \
        --endpoint-url "$ENDPOINT" >/dev/null 2>&1; then
        echo "DynamoDB table 'vms' already exists."
    else
        echo "Could not create or find DynamoDB table 'vms'." >&2
        exit 1
    fi

fi

# ============================================================
# DynamoDB - Users
# ============================================================

echo ""
echo "Creating DynamoDB table: users..."

if aws dynamodb describe-table \
    --table-name users \
    --region "$REGION" \
    --endpoint-url "$ENDPOINT" >/dev/null 2>&1; then

    echo "DynamoDB table 'users' already exists."

else

    if aws dynamodb create-table \
        --table-name users \
        --attribute-definitions \
            AttributeName=id,AttributeType=S \
        --key-schema \
            AttributeName=id,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region "$REGION" \
        --endpoint-url "$ENDPOINT" >/dev/null; then
        echo "DynamoDB table 'users' created."
    elif aws dynamodb describe-table \
        --table-name users \
        --region "$REGION" \
        --endpoint-url "$ENDPOINT" >/dev/null 2>&1; then
        echo "DynamoDB table 'users' already exists."
    else
        echo "Could not create or find DynamoDB table 'users'." >&2
        exit 1
    fi

fi

# ============================================================
# Default users
# ============================================================

ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin123!}"

CLIENT_EMAIL="${CLIENT_EMAIL:-client@example.com}"
CLIENT_PASSWORD="${CLIENT_PASSWORD:-Client123!}"

# ============================================================
# Password hashing
# ============================================================

password_hash() {
    python3 -c '
import hashlib
import secrets
import sys

password = sys.argv[1].encode()
salt = secrets.token_hex(16)

derived = hashlib.scrypt(
    password,
    salt=salt.encode(),
    n=16384,
    r=8,
    p=1,
    dklen=64
)

print(f"{salt}:{derived.hex()}")
' "$1"
}

# ============================================================
# Seed user
# ============================================================

seed_user() {
    local id="$1"
    local email="$2"
    local role="$3"
    local name="$4"
    local password="$5"

    local password_hash_value
    local created_at

    password_hash_value=$(password_hash "$password")
    created_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)

    aws dynamodb put-item \
        --table-name users \
        --item "{
            \"id\": {\"S\": \"$id\"},
            \"email\": {\"S\": \"$email\"},
            \"role\": {\"S\": \"$role\"},
            \"name\": {\"S\": \"$name\"},
            \"passwordHash\": {\"S\": \"$password_hash_value\"},
            \"createdAt\": {\"S\": \"$created_at\"}
        }" \
        --region "$REGION" \
        --endpoint-url "$ENDPOINT" \
        --return-values NONE >/dev/null

    echo "Seeded user: $email [$role]"
}

# ============================================================
# Create default users
# ============================================================

echo ""
echo "Creating default application users..."

seed_user \
    "seed-admin" \
    "$ADMIN_EMAIL" \
    "Admin" \
    "Administrator" \
    "$ADMIN_PASSWORD"

seed_user \
    "seed-client" \
    "$CLIENT_EMAIL" \
    "Client" \
    "Client" \
    "$CLIENT_PASSWORD"

# ============================================================
# Initialization completed
# ============================================================

echo ""
echo "======================================"
echo "LocalStack initialization completed"
echo "======================================"

echo ""
echo "DynamoDB tables:"
echo "  - vms"
echo "  - users"

echo ""
echo "Default users:"
echo "  Admin:"
echo "    Email: $ADMIN_EMAIL"
echo "    Role:  Admin"

echo ""
echo "  Client:"
echo "    Email: $CLIENT_EMAIL"
echo "    Role:  Client"

echo ""
echo "======================================"
