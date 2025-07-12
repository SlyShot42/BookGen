import json
import os
import requests

OPENAI_API_KEY_ARN = os.environ["OPENAI_API_KEY_ARN"]
SECRETS_EXTENSION_ENDPOINT = (
    f"http://localhost:2773/secretsmanager/get?secretId={OPENAI_API_KEY_ARN}"
)
headers = {"X-Aws-Parameters-Secrets-Token": os.environ.get("AWS_SESSION_TOKEN")}


def get_openai_api_key():
    """Fetches the OpenAI API key from AWS Secrets Manager using the Secrets Manager extension."""
    response = requests.get(SECRETS_EXTENSION_ENDPOINT, headers=headers)
    secret = response.json()
    return secret["SecretString"], response.status_code


def lambda_handler(event, context):
    """Sample pure Lambda function

    Parameters
    ----------
    event: dict, required
        API Gateway Lambda Proxy Input Format

        Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format

    context: object, required
        Lambda Context runtime methods and attributes

        Context doc: https://docs.aws.amazon.com/lambda/latest/dg/python-context-object.html

    Returns
    ------
    API Gateway Lambda Proxy Output Format: dict

        Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
    """

    try:
        openai_api_key, status_code = get_openai_api_key()
        print(f"Retrieved secret: {openai_api_key}")
        return {
            "statusCode": status_code,
            "body": json.dumps(
                {"message": "Successfully retrieved secret", "secretRetrieved": True}
            ),
        }
    except Exception as e:
        # Send some context about this error to Lambda Logs
        print(e)
        return {
            "statusCode": 500,
            "body": json.dumps(
                {"message": "Failed to retrieve secret", "error": str(e)}
            ),
        }
