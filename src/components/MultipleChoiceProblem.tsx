import { MultipleChoiceType } from "../pages/landing/Landing";
import MyMarkdown from "./MyMarkdown";

function MultipleChoiceProblem({ problem }: { problem: MultipleChoiceType }) {
  return (
    <article className="prose prose-p:my-0">
      <MyMarkdown content={problem.statement} />
    </article>
  );
}

export default MultipleChoiceProblem;
