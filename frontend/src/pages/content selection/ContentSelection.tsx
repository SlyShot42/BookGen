import React from "react";
// import { useLocation } from "react-router-dom";
// import { z } from "zod";
import {
  ContentifiedChapterDetailsType,
  ContentifiedSectionDetailsType,
} from "../landing/Landing";
import { useImmerReducer } from "use-immer";
import { useRef } from "react";
import BookGenerator from "../../components/BookGenerator(v2)";
import { useChapters } from "../../ChaptersUtils";

// type ContentifiedChapterDetailsType = z.infer<
//   typeof ContentifiedChapterDetails
// >;
// type ContentifiedSectionDetailsType = z.infer<
//   typeof ContentifiedSectionDetails
// >;

function BookContentSelector() {
  // const location = useLocation();
  // const chapters = location.state.tableOfContents;
  // const topic = location.state.topic;
  const chapters = useChapters();
  // const [chapterSelectionState, dispatchSelectionState] = useImmerReducer(chapterSelectionReducer, Array(chapters.length).fill(false));
  const initialSectionSelectionState = chapters.map((chapter) => {
    return chapter.sections.map((section) => section.content.article !== "");
  });
  const initialChapterSelectionState = chapters.map((chapter) =>
    chapter.sections.every((section) => section.content.article !== ""),
  );

  const chapterSelectionState = useRef(initialChapterSelectionState);
  const [sectionSelectionState, dispatchSectionSelectionState] =
    useImmerReducer(sectionSelectionReducer, initialSectionSelectionState);
  const [submitSelection, dispatchSubmitSelection] = useImmerReducer(
    submitSelectionReducer,
    false,
  );
  // console.log(chapterSelectionState);
  console.log(sectionSelectionState);

  const handleContentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatchSubmitSelection({ type: "set true" });
    (document.getElementById("my_modal") as HTMLDialogElement)?.showModal();
  };

  const handleChapterClick = (index: number) => {
    // dispatchSelectionState({ type: 'toggle chapter selection', index });
    chapterSelectionState.current[index] =
      !chapterSelectionState.current[index];
    if (chapterSelectionState.current[index]) {
      dispatchSectionSelectionState({
        type: "set true",
        indices: chapters[index].sections.map((_, i) => [index, i]),
      });
    } else {
      dispatchSectionSelectionState({
        type: "set false",
        indices: chapters[index].sections.map((_, i) => [index, i]),
      });
    }
    // dispatchSectionSelectionState({ type: 'set true',  indices: chapters[index].sections.map((_: void, i: number) => [index, i]) });
  };

  const handleSectionClick = (index: [number, number]) => {
    dispatchSectionSelectionState({
      type: "toggle section selection",
      indices: [index],
    });
  };

  function getSelectedIndices(selectionState: boolean[][]): [number, number][] {
    const selectedIndices: [number, number][] = [];

    selectionState.forEach((chapter, chapterIndex) => {
      !initialChapterSelectionState[chapterIndex] &&
        chapter.forEach((isSelected, sectionIndex) => {
          !initialSectionSelectionState[chapterIndex][sectionIndex] &&
            isSelected &&
            selectedIndices.push([chapterIndex, sectionIndex]);
        });
    });
    console.log(selectedIndices);
    return selectedIndices;
  }

  return (
    <section className="h-full" data-theme="autumn">
      <div className="m-auto flex h-full w-full max-w-7xl flex-col px-0 lg:px-2.5">
        <h1 className="text-center text-5xl lg:text-6xl xl:text-7xl">
          Book Content Selection
        </h1>
        <div className="divider mt-1 mb-0 h-0"></div>

        <form
          className="flex h-full flex-col overflow-y-auto"
          onSubmit={handleContentSubmit}
        >
          <div className="grow overflow-y-auto">
            <article className="prose mx-auto w-full max-w-3xl px-2.5 pr-3.5 text-base lg:px-0 lg:text-3xl">
              <ol>
                {chapters.map((chapter: ContentifiedChapterDetailsType) => (
                  <li key={chapter.number}>
                    <div className="group">
                      <label className="label w-full cursor-pointer">
                        <span className="label-text text-wrap">
                          <strong>{chapter.title}</strong>
                        </span>
                        <input
                          disabled={
                            initialChapterSelectionState[chapter.number - 1]
                          }
                          type="checkbox"
                          className="checkbox checkbox-primary checkbox-md lg:checkbox-lg ml-auto"
                          checked={sectionSelectionState[
                            chapter.number - 1
                          ].every((section: boolean) => section)}
                          onChange={() =>
                            handleChapterClick(chapter.number - 1)
                          }
                        />
                      </label>
                      <div
                        className={`divider group-hover:divider-primary my-1 ${
                          chapterSelectionState.current[chapter.number - 1] &&
                          "divider-primary"
                        }`}
                      ></div>
                    </div>
                    <ol className="my-1 list-[upper-roman]">
                      {chapter.sections.map(
                        (section: ContentifiedSectionDetailsType) => (
                          <li key={section.number}>
                            <label className="label w-full cursor-pointer">
                              <span className="label-text text-wrap">
                                {section.title}
                              </span>
                              <input
                                disabled={
                                  initialSectionSelectionState[
                                    chapter.number - 1
                                  ][section.number - 1]
                                }
                                type="checkbox"
                                className="checkbox checkbox-sm lg:checkbox-md checkbox-primary ml-auto"
                                checked={
                                  sectionSelectionState[chapter.number - 1][
                                    section.number - 1
                                  ]
                                }
                                onChange={() =>
                                  handleSectionClick([
                                    chapter.number - 1,
                                    section.number - 1,
                                  ])
                                }
                              />
                            </label>
                          </li>
                        ),
                      )}
                    </ol>
                  </li>
                ))}
              </ol>
            </article>
          </div>
          <div className="divider mt-0 mb-1 h-0"></div>
          <button
            type="submit"
            className="btn btn-wide btn-primary my-3 self-center"
            disabled={getSelectedIndices(sectionSelectionState).length === 0}
          >
            Generate Book
          </button>
        </form>
      </div>
      <dialog
        id="my_modal"
        className="modal modal-bottom sm:modal-middle"
        onCancel={(e) => e.preventDefault()}
      >
        <div className="modal-box">
          {submitSelection && (
            <BookGenerator
              selections={getSelectedIndices(sectionSelectionState)}
            />
          )}
        </div>
      </dialog>
    </section>
  );
}

function submitSelectionReducer(_: boolean, action: { type: string }) {
  switch (action.type) {
    case "set true": {
      return true;
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function sectionSelectionReducer(
  draft: boolean[][],
  action: { type: string; indices: [number, number][] },
) {
  switch (action.type) {
    case "toggle section selection": {
      draft[action.indices[0][0]][action.indices[0][1]] =
        !draft[action.indices[0][0]][action.indices[0][1]];
      return;
    }
    case "set true": {
      action.indices.map((index) => (draft[index[0]][index[1]] = true));
      return;
    }
    case "set false": {
      action.indices.map((index) => (draft[index[0]][index[1]] = false));
      return;
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export default BookContentSelector;
