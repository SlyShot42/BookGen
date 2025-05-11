import { MultipleChoiceType } from "../pages/landing/Landing";
import MyMarkdown from "./MyMarkdown";

function MultipleChoiceProblem({ problem }: { problem: MultipleChoiceType }) {
  return (
    <article className="prose prose-p:my-0">
      <MyMarkdown content={problem.statement} className="font-semibold" />
      {problem.options.map((option: string, index: number) => {
        return (
          <div key={index} className="form-control w-fit">
            <label className="cursor-pointer label gap-x-3">
              <input type="radio" name="radio-10" className="radio" />
              <span className="label-text">
                <MyMarkdown content={option} />
              </span>
            </label>
          </div>
        );
      })}
    </article>
  );
}

export default MultipleChoiceProblem;
