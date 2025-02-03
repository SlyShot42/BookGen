import { createContext, useEffect } from "react";
import {
  ContentDetailsType,
  ContentifiedChaptersArrayType,
} from "./pages/landing/Landing";
// import { ProblemType } from "./pages/landing/Landing";
import { ImmerReducer, useImmerReducer } from "use-immer";

type InitializeAction = {
  type: "initialize";
  payload: ContentifiedChaptersArrayType;
};

type AddSectionArticleAction = {
  type: "add_section_content";
  sectionIndex: [number, number];
  content: ContentDetailsType | null | undefined;
};

// type AddSectionProblemAction = {
//   type: "add_section_problem";
//   sectionIndex: [number, number];
//   problem: ProblemType;
// }

type Action = InitializeAction | AddSectionArticleAction;

export const ChaptersContext =
  createContext<ContentifiedChaptersArrayType | null>(null);
export const ChaptersDispatchContext =
  createContext<React.Dispatch<Action> | null>(null);

export function ChaptersProvider({ children }: { children: React.ReactNode }) {
  const [chapters, dispatchChapters] = useImmerReducer(
    chaptersReducer,
    [],
    (initial) => {
      const sessionChapters = sessionStorage.getItem("chapters");
      return sessionChapters ? JSON.parse(sessionChapters) : initial;
    }
  );

  useEffect(() => {
    sessionStorage.setItem("chapters", JSON.stringify(chapters));
  }, [chapters]);

  return (
    <ChaptersContext.Provider value={chapters}>
      <ChaptersDispatchContext.Provider value={dispatchChapters}>
        {children}
      </ChaptersDispatchContext.Provider>
    </ChaptersContext.Provider>
  );
}

const chaptersReducer: ImmerReducer<ContentifiedChaptersArrayType, Action> = (
  draft,
  action
) => {
  switch (action.type) {
    case "initialize":
      return action.payload;
    case "add_section_content":
      draft[action.sectionIndex[0]].sections[action.sectionIndex[1]].content =
        action.content!;
      return draft;
    // case "add_section_problem":
    //   draft[action.sectionIndex[0]].sections[action.sectionIndex[1]].content.problems.push(
    //     action.problem
    //   );
    //   return draft;
    default:
      throw new Error(`Unhandled action type: ${action}`);
  }
};
