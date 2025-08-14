import json
from copy import deepcopy
import re
from typing import Literal, Union
from openai import OpenAI
from pydantic import BaseModel
from myhelpers import get_openai_api_key

OPENAI_ARTICLE_MODEL = "gpt-5"
OPENAI_PROBLEM_MODEL = "gpt-5-mini"


class FreeResponse(BaseModel):
    code: Literal["FRQ"]
    statement: str
    answer: str


class Code(BaseModel):
    code: Literal["CODE"]
    statement: str
    setup: str
    correctCode: str
    testCases: list[str]


class MultipleChoice(BaseModel):
    code: Literal["MCQ"]
    statement: str
    options: list[str]
    answerIndex: int


# Union type for any problem
Problem = Union[MultipleChoice, FreeResponse, Code]


class ProblemSet(BaseModel):
    problems: list[Problem]


def markdown_formatting(text: str) -> str:
    """Converts LaTeX delimiters to markdown format."""
    # Replace \[...\] with $$...$$
    text = re.sub(r"\\\[(.*?)\\\]", r"$$\1$$", text, flags=re.DOTALL)

    # Replace \(...\) with $...$
    text = re.sub(r"\\\((.*?)\\\)", r"$\1$", text)

    return text


def format_problems(problems: list[Problem]) -> ProblemSet:
    """Formats each problem's text content into markdown."""
    for problem in problems:
        problem["statement"] = markdown_formatting(problem["statement"])
        if problem["code"] == "FRQ":
            problem["answer"] = markdown_formatting(problem["answer"])
        elif problem["code"] == "MCQ":
            problem["options"] = [
                markdown_formatting(option) for option in problem["options"]
            ]


def lambda_handler(event, _):
    """Lambda function handler to generate content for a textbook section based on a given topic and section title."""
    openai_api_key, _ = get_openai_api_key()
    client = OpenAI(api_key=openai_api_key)

    try:
        body = json.loads(event["body"])
        topic = body["topic"]
        section_title = body["sectionTitle"]
        num_problems = body.get("numProblems", 2)
        # Your Lambda function logic here
        response = client.responses.create(
            model=OPENAI_ARTICLE_MODEL,
            instructions="You are a course textbook content generation machine designed to output in markdown(surround inline latex with $..$ and display latex with $$..$$). Do not acknowledge or greet. Output the content only. Expand on information where appropriate. Do not include section title in reponse.",
            input=f"Generate the content of the section (do not include section title in reponse): \n{section_title}\n in the\n{topic}\n textbook.",
            # temperature=0.4,
        )
        print(f"Topic: {topic}, Section Title: {section_title}")
        article = response.output_text
        article = markdown_formatting(article)
        print(f"Generated article: {article}")
        examples = """Problems: [
            {
                "code": "MCQ",
                "statement": "What is the capital of France?",
                "options": ["Paris", "London", "Berlin", "Madrid"],
                "answerIndex": 0
            },
            {
                "code": "FRQ",
                "statement": "Describe Elon Musk.",
                "answer": "Elon Musk (b. 28 June 1971) is a South-African-born American entrepreneur and engineer best known as the CEO of Tesla, founder & chief engineer of SpaceX, and owner of X Corp. (formerly Twitter); he has also co-founded ventures such as Neuralink, The Boring Company and xAI."
            },
            {
                "code": "CODE",
                "statement": "Complete the function add(a,b) that returns the sum of two numbers",
                "setup": "def add(a, b): \\n\\t# your code here",
                "correctCode": "def add(a, b): \\n\\treturn a + b",
                "testCases": ["print(add(1, 2) == 3)", "print(add(-1, 1) == 0)", "print(add(0, 0) == 0)"]
            }
        ]"""
        generated_problems = client.responses.parse(
            model=OPENAI_PROBLEM_MODEL,
            instructions=f"""You are a course textbook problem generation machine designed to output in JSON in the format: \n
            {examples}
            \nUse markdown(surround any inline latex math expressions with $..$ and display latex math expressions with $$..$$) for statement field. The setup field for any CODE problem is to contain only setup code for the problem and nothing else. For the code problem statement, include any and all necessary information for the user to understand the problem along with the functions and variables to be used in the testcases. Ensure that correct code generated adheres strictly to the structure layed out in the setup code. Similarly, ensure that each testcase can run independently when appended to the correct code individually. LEAVE NO ROOM FOR AMBIGUITY.""",
            input=f"""Generate exactly {num_problems} problems of random types for the section: \n ${section_title} \n in the ${topic} textbook.
            \nreferencing the section content\n
            {article}""",
            text_format=ProblemSet,
            # temperature=0.2,
        )
        generated_problems_copy = deepcopy(
            generated_problems.output_parsed.model_dump(exclude_none=True)
        )
        problems = generated_problems_copy["problems"]
        format_problems(problems)
        return {
            "statusCode": 200,
            "body": {"article": article, "problems": problems},
        }
    except Exception as e:
        # Send some context about this error to Lambda Logs
        print(e)
        return {
            "statusCode": 500,
            "body": {"message": "API Call Failed", "error": str(e)},
        }
