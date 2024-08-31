import { createContext } from "react";
import { ContentifiedChaptersArrayType } from "./pages/landing/Landing";
import { ImmerReducer, useImmerReducer } from "use-immer";

type InitializeAction = {
  type: "initialize";
  payload: ContentifiedChaptersArrayType;
};

type AddSectionContentAction = {
  type: "add_section_content";
  sectionIndex: [number, number];
  content: string | null | undefined;
};

type Action = InitializeAction | AddSectionContentAction;

export const ChaptersContext =
  createContext<ContentifiedChaptersArrayType | null>(null);
export const ChaptersDispatchContext =
  createContext<React.Dispatch<Action> | null>(null);

export function ChaptersProvider({ children }: { children: React.ReactNode }) {
  const [chapters, dispatchChapters] = useImmerReducer(chaptersReducer, []);

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
    default:
      throw new Error(`Unhandled action type: ${action}`);
  }
};
