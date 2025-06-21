import { useImmerReducer } from "use-immer";
import { MultipleChoiceType } from "../pages/landing/Landing";
import MyMarkdown from "./MyMarkdown";

type Status = "unselected" | "selected" | "correct" | "incorrect";

function MultipleChoiceProblem({
  problem,
  chapterIndex,
  sectionIndex,
  problemIndex,
}: {
  problem: MultipleChoiceType;
  chapterIndex: number;
  sectionIndex: number;
  problemIndex: number;
}) {
  const [selectionState, dispatchSelectionState] = useImmerReducer(
    selectionStateReducer,
    problem.options.map(() => ({
      status: "unselected" as Status,
      disabled: false,
    })),
  );

  const [attemptsRemaining, dispatchAttemptsRemaining] = useImmerReducer(
    attemptsRemainingReducer,
    2,
  );

  const stateToClassMap: Record<Status, string> = {
    unselected: "",
    selected: "menu-active",
    correct: "bg-success text-success-content",
    incorrect: "bg-error text-error-content",
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const selectedIndex = selectionState.findIndex(
      (obj) => obj.status === "selected",
    );
    if (selectedIndex === problem.answerIndex) {
      // mark user selection as correct
      dispatchSelectionState({ type: "mark correct", index: selectedIndex });
      dispatchAttemptsRemaining({ type: "decrement to zero" });
      dispatchSelectionState({ type: "disable all" });
    } else {
      // mark user selection as incorrect
      dispatchSelectionState({ type: "mark incorrect", index: selectedIndex });
      dispatchAttemptsRemaining({ type: "decrement" });
      const nextAttemptRemaining = attemptsRemaining - 1;
      if (nextAttemptRemaining === 0) {
        // show correct answer
        dispatchSelectionState({
          type: "mark correct",
          index: problem.answerIndex,
        });
        // mark all other options as disabled
        dispatchSelectionState({ type: "disable all" });
      }
    }
  };
  const allUnselected = selectionState.every(
    (option) => option.disabled || option.status === "unselected",
  );
  const submitDisabled = attemptsRemaining === 0 || allUnselected;
  return (
    <form
      className="size-full"
      id={`problem-from-${chapterIndex}.${sectionIndex}.${problemIndex}`}
      onSubmit={(e) => handleFormSubmit(e)}
    >
      <ul className="menu not-prose w-full p-0">
        <li>
          <MyMarkdown
            content={problem.statement}
            className="menu-title px-0 py-0"
          />
          <ul className="m-0">
            {problem.options.map((option: string, index: number) => {
              return (
                <li
                  key={index}
                  className={`${selectionState[index].disabled && "menu-disabled"} mt-1 w-full`}
                  onClickCapture={() =>
                    dispatchSelectionState({ type: "toggle", index })
                  }
                >
                  <a
                    className={`text-pretty hover:text-inherit ${stateToClassMap[selectionState[index].status]}`}
                  >
                    <input
                      type="radio"
                      name={`radio-${chapterIndex}.${sectionIndex}.${problemIndex}`}
                      className="radio"
                      checked={selectionState[index].status === "selected"}
                      disabled={selectionState[index].disabled}
                      readOnly
                      // onChange={() =>
                      //   dispatchSelectionState({ type: "toggle", index })
                      // }
                    />
                    <MyMarkdown content={option} />
                  </a>
                </li>
              );
            })}
          </ul>
        </li>
      </ul>
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
    </form>
  );
}

function selectionStateReducer(
  draft: { status: Status; disabled: boolean }[],
  action: { type: string; index?: number },
) {
  switch (action.type) {
    case "toggle": {
      if (draft[action.index!].disabled) return;

      const wasSelected = draft[action.index!].status === "selected";

      // clear without shared references
      for (let i = 0; i < draft.length; i++) {
        if (draft[i].disabled) continue;
        draft[i].status = "unselected";
        draft[i].disabled = false;
      }

      if (!wasSelected) {
        // <‑‑ re‑select only if it was OFF
        draft[action.index!].status = "selected";
      }
      break;
    }

    case "mark correct": {
      draft[action.index!].status = "correct";
      draft[action.index!].disabled = true;
      break;
    }
    case "mark incorrect": {
      draft[action.index!].status = "incorrect";
      draft[action.index!].disabled = true;
      break;
    }
    case "disable all": {
      draft.forEach((option) => {
        option.disabled = true;
      });
      break;
    }
  }
}

function attemptsRemainingReducer(draft: number, action: { type: string }) {
  switch (action.type) {
    case "decrement": {
      return draft - 1;
    }
    case "reset": {
      return 2;
    }
    case "decrement to zero": {
      return 0;
    }
  }
}

export default MultipleChoiceProblem;
