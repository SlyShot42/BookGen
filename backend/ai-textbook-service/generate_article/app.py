import json
from openai import OpenAI
from myhelpers import get_openai_api_key, markdown_formatting

OPENAI_MODEL = "gpt-5-mini"


def lambda_handler(event, _):
    """Lambda function handler to generate article for a textbook section based on a given topic and section title."""
    openai_api_key, _ = get_openai_api_key()
    client = OpenAI(api_key=openai_api_key)

    try:
        body = json.loads(event["body"])
        topic = body["topic"]
        section_title = body["sectionTitle"]
        # Your Lambda function logic here
        print(f"Topic: {topic}, Section Title: {section_title}")
        response = client.responses.create(
            model=OPENAI_MODEL,
            instructions="You are a course textbook article generation machine designed to output in markdown(surround inline latex with $..$ and display latex with $$..$$). Do not acknowledge or greet. Output the article only. Expand on information where appropriate. Do not include section title in reponse.",
            input=f"Generate the article of the section (do not include section title in reponse): \n{section_title}\n in the\n{topic}\n textbook.",
            # temperature=0.4,
        )
        article = response.output_text
        article = markdown_formatting(article)
        print(f"Generated article: {article}")

        return {
            "statusCode": 200,
            "body": {"article": article},
        }
    except Exception as e:
        # Send some context about this error to Lambda Logs
        print(e)
        return {
            "statusCode": 500,
            "body": {"message": "API Call Failed", "error": str(e)},
        }
