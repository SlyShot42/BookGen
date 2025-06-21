import { CodeType } from "../pages/landing/Landing";
import MyMarkdown from "./MyMarkdown";

function CodeProblem({ problem }: { problem: CodeType }) {
  return (
    <article className="prose prose-p:my-0">
      <MyMarkdown content={problem.statement} />
    </article>
  );
}

export default CodeProblem;
