import { FreeResponseType } from "../pages/landing/Landing";
import MyMarkdown from "./MyMarkdown";

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
  const attemptsRemaining = 2;
  const submitDisabled = false;
  const dummyAIResponse =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
  return (
    <form
      id={`problem-${chapterIndex}.${sectionIndex}.${problemIndex}`}
      className="size-full"
    >
      <MyMarkdown
        content={problem.statement}
        className="prose lg:prose-p:mt-0 w-full max-w-none"
      />
      <textarea
        className="textarea textarea-neutral textarea-md text-neutral mt-1 h-24 w-full resize-none font-mono font-bold md:h-62 lg:mt-0 lg:h-52 landscape:mt-1 landscape:h-24"
        placeholder="Type your answer here..."
      />
      <div className="mt-1.5 w-full">
        <button
          type="submit"
          name="action"
          value="submit"
          className="btn btn-outline btn-primary btn-block"
          disabled={submitDisabled}
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
      <div className="divider my-1"></div>
      <div className="card bg-base-100 card-md lg:card-lg w-full shadow-sm">
        <div className="card-body">
          <h2 className="card-title">AI Feedback:</h2>
          <p>{dummyAIResponse}</p>
          <div role="alert" className="alert alert-success w-full">
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
            <span>Passed! Your score is: 8/10</span>
          </div>
        </div>
      </div>
    </form>
  );
}

export default FreeResponseProblem;
