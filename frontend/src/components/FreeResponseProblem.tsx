import { useMutation } from "@tanstack/react-query";
import { FreeResponseType } from "../pages/landing/Landing";
import MyMarkdown from "./MyMarkdown";
import { useImmerReducer } from "use-immer";
import { useTopic } from "../TopicUtils";

function FreeResponseProblem({
  problem,
  chapterIndex,
  sectionIndex,
  problemIndex,
}: {
  problem: FreeResponseType;
  chapterIndex: number;
  sectionIndex: number;
  problemIndex: number;
}) {
  // const cleanedStatement = problem.statement.replace(/\\n/g, "\n");
  const [attemptsRemaining, dispatchAttemptsRemaining] = useImmerReducer(
    attemptsRemainingReducer,
    2,
  );
  const submitDisabled = attemptsRemaining === 0;
  // const dummyAIResponse =
  //   "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

  const [userAnswer, dispatchUserAnswer] = useImmerReducer(
    userAnswerReducer,
    "",
  );
  const topic = useTopic();
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        "https://irrdfl62oxriocu5s3geotbfnq0nkwdg.lambda-url.us-west-1.on.aws/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: topic,
            problemStatement: problem.statement,
            correctAnswer: problem.answer,
            userAnswer: userAnswer,
          }),
        },
      );
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      return res.json();
    },
    onSuccess: (data) => {
      data.passed
        ? dispatchAttemptsRemaining({ type: "decrement to zero" })
        : dispatchAttemptsRemaining({ type: "decrement" });
      console.log("AI response successfully processed.");
      console.log("AI response data:", data);
    },
    onError: (error: Error) => {
      console.error("Error fetching AI response:", error);
      // Optionally, notify the user about the error
    },
  });

  const handleUserAnswerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate();
  };

  console.log(userAnswer);

  return (
    <form
      id={`problem-${chapterIndex}.${sectionIndex}.${problemIndex}`}
      className="size-full"
      onSubmit={handleUserAnswerSubmit}
    >
      <MyMarkdown
        content={problem.statement}
        className="prose lg:prose-p:mt-0 w-full max-w-none"
      />
      <textarea
        className="textarea textarea-neutral textarea-md text-neutral mt-1 h-24 w-full resize-none font-mono font-bold md:h-62 lg:mt-0 lg:h-52 landscape:mt-1 landscape:h-24"
        placeholder="Type your answer here..."
        onChange={(e) =>
          dispatchUserAnswer({ type: "set", payload: e.target.value })
        }
        value={userAnswer}
      />
      <div className="mt-2 w-full">
        <button
          type="submit"
          name="action"
          value="submit"
          className="btn btn-outline btn-primary btn-block"
          disabled={submitDisabled || userAnswer.trim() === ""}
        >
          Submit
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="ml-1 size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            />
          </svg>
          {`(${attemptsRemaining} attempts remaining)`}
        </button>
      </div>
      {mutation.isPending && (
        <span className="loading loading-dots loading-lg"></span>
      )}
      {mutation.isSuccess && mutation.data && (
        <>
          <div className="divider my-1"></div>
          <div className="card bg-base-100 card-md lg:card-lg w-full shadow-sm">
            <div className="card-body">
              {attemptsRemaining > 0 ? (
                <>
                  <h2 className="card-title">AI Feedback:</h2>
                  <p>
                    <MyMarkdown
                      content={mutation.data.feedback}
                      className="prose lg:prose-p:mt-0 w-full max-w-none"
                    />
                  </p>
                </>
              ) : (
                <>
                  <h2 className="card-title">Answer:</h2>
                  <p>
                    <MyMarkdown
                      content={problem.answer}
                      className="prose lg:prose-p:mt-0 w-full max-w-none"
                    />
                  </p>
                </>
              )}
              <div
                role="alert"
                className={
                  mutation.data.passed
                    ? "alert alert-success alert-soft w-full"
                    : "alert alert-error alert-soft w-full"
                }
              >
                {mutation.data.passed ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 shrink-0 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 shrink-0 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                <span>
                  <strong>
                    {mutation.data.passed ? "Passed!" : "Failed!"}
                  </strong>{" "}
                  Your score is: <strong>{mutation.data.score}/10</strong>
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </form>
  );
}

function userAnswerReducer(
  _: string,
  action: { type: string; payload: string },
) {
  switch (action.type) {
    case "set":
      return action.payload;
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

function attemptsRemainingReducer(state: number, action: { type: string }) {
  switch (action.type) {
    case "decrement":
      return state - 1;
    case "decrement to zero":
      return 0;
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

export default FreeResponseProblem;
