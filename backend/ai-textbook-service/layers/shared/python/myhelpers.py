import json
import os
import re
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


def markdown_formatting(text: str) -> str:
    """Converts LaTeX delimiters to markdown format and fixes common LaTeX formatting issues."""

    # Fix missing backslashes in common LaTeX commands (only if backslash is missing)
    # Use negative lookbehind to avoid double-escaping already correct commands
    text = re.sub(r"(?<!\\)\btextbf\{", r"\\textbf{", text)
    text = re.sub(r"(?<!\\)\btext\{", r"\\text{", text)
    text = re.sub(r"(?<!\\)\bmathbf\{", r"\\mathbf{", text)
    text = re.sub(r"(?<!\\)\bfrac\{", r"\\frac{", text)
    text = re.sub(r"(?<!\\)\bsqrt\{", r"\\sqrt{", text)

    # Fix standalone math operators (only if not already escaped)
    text = re.sub(r"(?<!\\)\bto\b(?!\w)", r"\\to", text)
    text = re.sub(r"(?<!\\)\btimes\b(?!\w)", r"\\times", text)
    text = re.sub(r"(?<!\\)\bcdot\b(?!\w)", r"\\cdot", text)
    text = re.sub(r"(?<!\\)\binfty\b(?!\w)", r"\\infty", text)
    text = re.sub(r"(?<!\\)\bnabla\b(?!\w)", r"\\nabla", text)
    text = re.sub(r"(?<!\\)\bpartial\b(?!\w)", r"\\partial", text)

    # Replace \[...\] with $$...$$
    text = re.sub(r"\\\[(.*?)\\\]", r"$$\1$$", text, flags=re.DOTALL)

    # Replace \(...\) with $...$
    text = re.sub(r"\\\((.*?)\\\)", r"$\1$", text)

    # Convert literal \n to actual newlines (fix the problem statement formatting)
    text = text.replace("\\n", "\n")

    return text
