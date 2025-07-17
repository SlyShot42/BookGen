from copy import deepcopy
import json
import os
from openai import OpenAI
from pydantic import BaseModel
import requests


OPENAI_API_KEY_ARN = os.environ["OPENAI_API_KEY_ARN"]
OPENAI_MODEL = "o4-mini-2025-04-16"
SECRETS_EXTENSION_ENDPOINT = (
    f"http://localhost:2773/secretsmanager/get?secretId={OPENAI_API_KEY_ARN}"
)
headers = {"X-Aws-Parameters-Secrets-Token": os.environ.get("AWS_SESSION_TOKEN")}


class SectionDetails(BaseModel):
    number: int
    title: str


class ChapterDetails(BaseModel):
    number: int
    title: str
    sections: list[SectionDetails]


class TableOfContents(BaseModel):
    chapters: list[ChapterDetails]


def get_openai_api_key():
    """Fetches the OpenAI API key from AWS Secrets Manager using the Secrets Manager extension."""
    response = requests.get(SECRETS_EXTENSION_ENDPOINT, headers=headers)
    secret_string = json.loads(response.text)["SecretString"]
    secret = json.loads(secret_string)["OPENAI_API_KEY"]
    return secret, response.status_code


def format_numbers(chapter: ChapterDetails, chapter_index: int):
    """Formats chapter and section numbers to be one-indexed."""
    chapter["number"] = chapter_index + 1
    for section_index, section in enumerate(chapter["sections"]):
        section["number"] = section_index + 1


def initialize_contents(chapter: ChapterDetails):
    """initalizes the content of each section in a chapter."""
    for section in chapter["sections"]:
        section["content"] = {
            "article": "",
            "problems": [],
        }


def format_initialize_toc(toc: TableOfContents):
    """Formats the table of contents by zero-padding chapter and section numbers."""
    for chapter_index, chapter in enumerate(toc["chapters"]):
        format_numbers(chapter, chapter_index)
        initialize_contents(chapter)


def lambda_handler(event, _):
    """
    Lambda function handler to generate a table of contents for a textbook based on a given topic.
    """

    try:
        body = json.loads(event["body"])
        topic = body["topic"]
        openai_api_key, status_code = get_openai_api_key()
        print(f"Retrieved secret: {openai_api_key}")

        client = OpenAI(api_key=openai_api_key)

        response = client.responses.parse(
            model=OPENAI_MODEL,
            instructions="You are a course textbook writing expert. Generate the table of contents (include chapter and sections) for a textbook on any of the user's stated topic(s)",
            input=topic,
            text_format=TableOfContents,
        )
        output_dict = deepcopy(response.output_parsed.model_dump(exclude_none=True))
        format_initialize_toc(output_dict)
        return {"statusCode": status_code, "body": output_dict}
    except Exception as e:
        # Send some context about this error to Lambda Logs
        print(e)
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "API Call Failed", "error": str(e)}),
        }
