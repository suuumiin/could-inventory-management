import boto3
from src.config import AWS_REGION, DYNAMODB_TABLE_NAME


class DynamoDBManager:

    def __init__(self):
        self.dynamodb = boto3.resource(
            "dynamodb",
            region_name=AWS_REGION
        )

        self.table = self.dynamodb.Table(
            DYNAMODB_TABLE_NAME
        )

    def test_connection(self):
        response = self.table.table_status
        return response