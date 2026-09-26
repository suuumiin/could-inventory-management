# Cloud-Based Inventory Management System

A simple college mini-project for managing product inventory using AWS.

## Planned architecture

Frontend
    -> Flask application
    -> AWS services (implemented one at a time)

## Planned AWS services

1. Amazon DynamoDB - inventory database
2. Amazon API Gateway - HTTP API
3. AWS Lambda - cloud backend

The project will be developed incrementally. Do not configure all AWS
services at once.

## Current stage

Stage 0: Local starter project.

At this stage:
- The Flask website runs locally.
- No cloud resource is required.
- DynamoDB code is only a starter access layer.
- No S3, Cognito, EC2, RDS, SQS, SNS, CloudFront, or other AWS service is included.

## Run locally

Create and activate a virtual environment, then install:

    pip install -r requirements.txt

Start the application:

    python run.py

Open:

    http://127.0.0.1:5000/

## Next development stages

Stage 1: Create DynamoDB table and implement product CRUD.

Stage 2: Move the backend operations behind API Gateway.

Stage 3: Deploy the backend logic using AWS Lambda.

Each stage should be tested before moving to the next one.
