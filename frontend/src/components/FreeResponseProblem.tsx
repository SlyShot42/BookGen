import { FreeResponseType } from "../pages/landing/Landing";
import MyMarkdown from "./MyMarkdown";

function FreeResponseProblem({ problem }: { problem: FreeResponseType }) {
  return (
    <article className="prose prose-p:my-0">
      <MyMarkdown content={problem.statement} />
    </article>
  );
}

export default FreeResponseProblem;
