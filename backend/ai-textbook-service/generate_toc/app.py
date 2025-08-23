from copy import deepcopy
import json
from openai import OpenAI
from pydantic import BaseModel
from myhelpers import get_openai_api_key


OPENAI_MODEL = "gpt-4.1"


class SectionDetails(BaseModel):
    """Model for section details in a chapter."""

    number: int
    title: str


class ChapterDetails(BaseModel):
    """Model for chapter details in a textbook."""

    number: int
    title: str
    sections: list[SectionDetails]


class TableOfContents(BaseModel):
    """Model for the table of contents of a textbook."""

    chapters: list[ChapterDetails]


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
            "body": {"message": "API Call Failed", "error": str(e)},
        }
