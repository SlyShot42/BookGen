import { ProblemType } from "../pages/landing/Landing";
import CodeProblem from "./CodeProblem";
import FreeResponseProblem from "./FreeResponseProblem";
import MultipleChoiceProblem from "./MultipleChoiceProblem";

function ProblemFactory({
  problem,
  sectionIndex,
  problemIndex,
}: {
  problem: ProblemType;
  sectionIndex: number;
  problemIndex: number;
}) {
  return (
    <div className="collapse-arrow bg-base-200 collapse my-3">
      <input type="checkbox" />
      <div className="collapse-title text-lg font-bold lg:text-xl xl:text-2xl">
        Problem {sectionIndex + 1}.{problemIndex + 1}: {problem.code}
      </div>
      <div className="collapse-content">
        {problem.code === "MCQ" && (
          <MultipleChoiceProblem
            problem={problem}
            sectionIndex={sectionIndex}
            problemIndex={problemIndex}
          />
        )}
        {problem.code === "FRQ" && <FreeResponseProblem problem={problem} />}
        {problem.code === "CODE" && <CodeProblem problem={problem} />}
      </div>
    </div>
  );
}

export default ProblemFactory;
