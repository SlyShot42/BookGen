# Generate TOC Lambda Function (Python)

This directory contains the serverless backend for BookGen.  The project is built
with the AWS Serverless Application Model (SAM) and deploys a single Lambda
function that generates table of contents data for the frontend.  The function is
exposed through a Lambda Function URL with CORS settings for local development
and the production Amplify app.

The repository contains the following folders:

- `generate_toc/` – Lambda function source code.
- `events/` – Sample invocation events for local testing.
- `template.yaml` – Definition of the AWS resources created by SAM.

The stack resources are defined in `template.yaml` and can be extended as your
application grows. Deploying this template creates the `GenerateTOCFunction` and
its Function URL which the frontend calls to generate table of contents data.

If you prefer to use an integrated development environment (IDE) to build and test your application, you can use the AWS Toolkit.  
The AWS Toolkit is an open source plug-in for popular IDEs that uses the AWS SAM CLI to build and deploy serverless applications on AWS. The AWS Toolkit also adds a simplified step-through debugging experience for Lambda function code. See the following links to get started.

- [CLion](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
- [GoLand](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
- [IntelliJ](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
- [WebStorm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
- [Rider](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
- [PhpStorm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
- [PyCharm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
- [RubyMine](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
- [DataGrip](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
- [VS Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/welcome.html)
- [Visual Studio](https://docs.aws.amazon.com/toolkit-for-visual-studio/latest/user-guide/welcome.html)

## Deploy the application

The AWS Serverless Application Model Command Line Interface (AWS SAM CLI) is a framework for building and testing Lambda applications. It uses Docker to run your functions in an Amazon Linux environment that matches Lambda. It can also emulate your application's build environment and API.

To use the AWS SAM CLI, you need the following tools.

### Requirements

- AWS SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- Docker - [Install Docker Desktop](https://hub.docker.com/search/?type=edition&offering=community)

To build and deploy the Lambda for the first time, run the following commands:

```bash
cd backend/ai-textbook-service
sam build --use-container
sam deploy --guided
```

The first command will build the source of your application. The second command will package and deploy your application to AWS, with a series of prompts:

- **Stack Name**: The name of the stack to deploy to CloudFormation. This should be unique to your account and region, and a good starting point would be something matching your project name.
- **AWS Region**: The AWS region you want to deploy your app to.
- **Confirm changes before deploy**: If set to yes, any change sets will be shown to you before execution for manual review. If set to no, the AWS SAM CLI will automatically deploy application changes.
- **GenerateTOCFunction has no authentication. Is this okay? [y/N]:** The function URL is secured with IAM by default. Answer `y` to allow the deployment. You can later restrict access with [Lambda Function URL policies](https://docs.aws.amazon.com/lambda/latest/dg/urls-auth.html).
- **Allow AWS SAM CLI IAM role creation**: Many AWS SAM templates, including this example, create AWS IAM roles required for the AWS Lambda function(s) included to access AWS services. By default, these are scoped down to minimum required permissions. To deploy an AWS CloudFormation stack which creates or modifies IAM roles, the `CAPABILITY_IAM` value for `capabilities` must be provided. If permission isn't provided through this prompt, to deploy this example you must explicitly pass `--capabilities CAPABILITY_IAM` to the `sam deploy` command.
- **Save arguments to samconfig.toml**: If set to yes, your choices will be saved to a configuration file inside the project.
- For future deploys, you can run `sam deploy` without parameters to deploy changes to your application.

The Lambda Function URL is printed in the stack outputs after deployment.

## Use AWS SAM CLI to test locally

The AWS SAM CLI installs dependencies defined in `generate_toc/requirements.txt`, creates a deployment package, and saves it in the `.aws-sam/build` folder.

You can test a single function by invoking it directly with a test event. An event is a JSON document that represents the input that the function receives from the event source. Test events are included in the `events` folder in this project.

Run functions locally and invoke them with the `sam local invoke` command.

```bash
sam local invoke GenerateTOCFunction --event events/event.json
```

You can also run the Lambda in a local service with `sam local start-lambda`:

```bash
sam local start-lambda
```

AWS SAM CLI reads the application template to determine how to invoke your function. The template exposes `GenerateTOCFunction` using a `FunctionUrlConfig` block:

```yaml
FunctionUrlConfig:
  AuthType: AWS_IAM
  Cors:
    AllowOrigins:
      - http://localhost:5173
      - https://main.d2xyu58sfma11c.amplifyapp.com
    AllowMethods:
      - GET
      - POST
```

## Use AWS SAM CLI to test remotely

After you have deployed your application, you can remotely invoke your Lambda function to test it in the cloud.

Invoke functions remotely with the `sam remote invoke` command.

```bash
sam remote invoke GenerateTOCFunction --event-file events/event.json
```

You can also open the Function URL printed after deployment to invoke your deployed Lambda function.

## Fetch, tail, and filter Lambda function logs

To simplify troubleshooting, AWS SAM CLI has a command called `sam logs`. `sam logs` lets you fetch logs generated by your deployed Lambda function from the command line. In addition to printing the logs on the terminal, this command has several nifty features to help you quickly find the bug.

`NOTE`: This command works for all AWS Lambda functions; not just the ones you deploy using AWS SAM.

```bash
sam logs -n GenerateTOCFunction --stack-name "YOUR_STACK_NAME_HERE" --tail
```

You can find more information and examples about filtering Lambda function logs in the [AWS SAM CLI Documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-logging.html).

## Cleanup

To delete the sample application that you created, use the AWS CLI. Assuming you used your project name for the stack name, you can run the following:

```bash
$ sam delete
```

## Resources

See the [AWS SAM developer guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) for an introduction to AWS SAM specification, the AWS SAM CLI, and serverless application concepts.
