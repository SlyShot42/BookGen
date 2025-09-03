from copy import deepcopy
import json
from openai import OpenAI
from pydantic import BaseModel
from myhelpers import get_openai_api_key, markdown_formatting


OPENAI_MODEL = "gpt-4.1"


class Grade(BaseModel):
    feedback: str
    score: int


def format_grade_output(grade: Grade):
    return {
        "feedback": markdown_formatting(grade["feedback"]),
        "passed": grade["score"] >= 7,
        "score": grade["score"],
    }


def lambda_handler(event, _):
    """
    Lambda function handler to generate a table of contents for a textbook based on a given topic.
    """

    try:
        body = json.loads(event["body"])
        user_answer = body["userAnswer"]
        correct_answer = body["correctAnswer"]
        topic = body["topic"]
        problem_statement = body["problemStatement"]
        openai_api_key, status_code = get_openai_api_key()
        print(f"Retrieved secret: {openai_api_key}")

        client = OpenAI(api_key=openai_api_key)

        response = client.responses.parse(
            model=OPENAI_MODEL,
            instructions="You are an expert in the field of "
            + topic
            + " and are designed to provide feedback and scoring on user answers without giving away the actual answer. Do not acknowledge or greet. Address the user's answer directly using second person. Ensure the scoring is out of 10 (1 being the lowest and 10 being the highest) and only generate an integer value that is between 1 and 10. When you are grading these answers, I want you to actually generate a valid rubrik internally and then score the user's answer relative to the correct answer based on the criteria generated as part of that internal rubrik.",
            input="Provide feedback and score (out of 10) without directly or indirectly giving away the answer: "
            + user_answer
            + " for the question: "
            + problem_statement
            + "using the correct answer: "
            + correct_answer,
            text_format=Grade,
        )
        output_dict = deepcopy(response.output_parsed.model_dump(exclude_none=True))
        formatted_response = format_grade_output(output_dict)
        return {"statusCode": status_code, "body": formatted_response}
    except Exception as e:
        # Send some context about this error to Lambda Logs
        print(e)
        return {
            "statusCode": 500,
            "body": {"message": "API Call Failed", "error": str(e)},
        }
