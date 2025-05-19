import { MultipleChoiceType } from "../pages/landing/Landing";
import MyMarkdown from "./MyMarkdown";

function MultipleChoiceProblem({
  problem,
  sectionIndex,
  problemIndex,
}: {
  problem: MultipleChoiceType;
  sectionIndex: number;
  problemIndex: number;
}) {
  return (
    <ul className="menu not-prose w-full p-0">
      <li>
        <MyMarkdown
          content={problem.statement}
          className="menu-title px-0 py-0"
        />
        <ul className="m-0">
          {problem.options.map((option: string, index: number) => {
            return (
              <li key={index} className="w-full">
                {/* <label className="label cursor-pointer gap-x-3"> */}
                {/* <span className="text-black"> */}
                <a className="text-pretty text-inherit hover:text-inherit">
                  <input
                    type="radio"
                    name={`radio-${sectionIndex}.${problemIndex}`}
                    className="radio"
                  />
                  <MyMarkdown content={option} />
                </a>
                {/* </span>
                </label> */}
              </li>
            );
          })}
        </ul>
      </li>
    </ul>
  );
}

export default MultipleChoiceProblem;
