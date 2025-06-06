import { ProblemType } from "../pages/landing/Landing";
import CodeProblem from "./CodeProblem";
import FreeResponseProblem from "./FreeResponseProblem";
import MultipleChoiceProblem from "./MultipleChoiceProblem";

function ProblemFactory({
  problem,
  chapterIndex,
  sectionIndex,
  problemIndex,
}: {
  problem: ProblemType;
  chapterIndex: number;
  sectionIndex: number;
  problemIndex: number;
}) {
  return (
    <div className="collapse-arrow bg-base-200 collapse my-3">
      <input type="checkbox" />
      <div className="collapse-title text-lg font-bold lg:text-xl xl:text-2xl">
        Problem {chapterIndex + 1}.{sectionIndex + 1}.{problemIndex + 1}:{" "}
        {problem.code}
      </div>
      <div className="collapse-content">
        {problem.code === "MCQ" && (
          <MultipleChoiceProblem
            problem={problem}
            chapterIndex={chapterIndex}
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
