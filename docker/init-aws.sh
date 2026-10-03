#!/bin/bash

set -e

REGION="us-east-1"
ENDPOINT="http://localhost:4566"

echo "======================================"
echo "Initializing LocalStack AWS resources"
echo "======================================"

echo ""
echo "Creating DynamoDB table: vms..."

aws dynamodb create-table \
    --table-name vms \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION" \
    --endpoint-url "$ENDPOINT"

echo "DynamoDB table 'vms' created."

echo ""
echo "Creating DynamoDB table: users..."

aws dynamodb create-table \
    --table-name users \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION" \
    --endpoint-url "$ENDPOINT"

echo "DynamoDB table 'users' created."

echo ""
echo "Creating Cognito User Pool..."

if USER_POOL_ID=$(aws cognito-idp create-user-pool \
    --pool-name vms-users \
    --region "$REGION" \
    --endpoint-url "$ENDPOINT" \
    --query 'UserPool.Id' \
    --output text 2>/dev/null); then

    echo "Cognito User Pool created: $USER_POOL_ID"

    echo ""
    echo "Creating Cognito App Client..."

    CLIENT_ID=$(aws cognito-idp create-user-pool-client \
        --user-pool-id "$USER_POOL_ID" \
        --client-name vms-client \
        --region "$REGION" \
        --endpoint-url "$ENDPOINT" \
        --query 'UserPoolClient.ClientId' \
        --output text)

    echo "Cognito App Client created: $CLIENT_ID"

else
    echo "WARNING: Cognito is not available in this LocalStack version."
    echo "DynamoDB resources were created successfully."
fi

echo ""
echo "======================================"
echo "LocalStack initialization completed"
echo "======================================"

echo ""
echo "DynamoDB:"
echo "  Table: vms"
echo "  Table: users"
echo "  Key:   id"

if [ -n "${USER_POOL_ID:-}" ]; then
    echo ""
    echo "Cognito:"
    echo "  User Pool ID: $USER_POOL_ID"
    echo "  Client ID:    $CLIENT_ID"
fi