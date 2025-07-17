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
    secret_string = json.loads(response.text)["SecretString"]
    secret = json.loads(secret_string)["OPENAI_API_KEY"]
    return secret, response.status_code
