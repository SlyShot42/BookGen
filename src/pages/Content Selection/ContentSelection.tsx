import React from 'react';
import { useLocation } from 'react-router-dom';
import { z } from 'zod';
import { SectionDetails, ChapterDetails } from '../landing/Landing';  
import { useImmerReducer } from 'use-immer';
import { useRef } from 'react';
import BookGenerator from '../../components/BookGenerator';


type ChapterDetailsType = z.infer<typeof ChapterDetails>;
type SectionDetailsType = z.infer<typeof SectionDetails>;


function BookContentSelector() {
  const location = useLocation();
  const chapters = location.state.tableOfContents;
  const topic = location.state.topic;
  // const [chapterSelectionState, dispatchSelectionState] = useImmerReducer(chapterSelectionReducer, Array(chapters.length).fill(false));
  const chapterSelectionState = useRef(Array(chapters.length).fill(false));
  const [sectionSelectionState, dispatchSectionSelectionState] = useImmerReducer(sectionSelectionReducer, chapters.map((chapter: ChapterDetailsType) => Array(chapter.sections.length).fill(false)));
  // const [submitSelection, dispatchSubmitSelection] = useImmerReducer(submitSelectionReducer, false);
  // console.log(chapterSelectionState);
  console.log(sectionSelectionState);

  const handleContentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // dispatchSubmitSelection({ type: 'set true' });
    (document.getElementById('my_modal') as HTMLDialogElement)?.showModal();
  }

  const handleChapterClick = (index: number) => {
    // dispatchSelectionState({ type: 'toggle chapter selection', index });
    chapterSelectionState.current[index] = !chapterSelectionState.current[index];
    if (chapterSelectionState.current[index]) {
      dispatchSectionSelectionState({ type: 'set true',  indices: chapters[index].sections.map((_: void, i: number) => [index, i]) });
    } else {
      dispatchSectionSelectionState({ type: 'set false',  indices: chapters[index].sections.map((_: void, i: number) => [index, i]) });
    }
    // dispatchSectionSelectionState({ type: 'set true',  indices: chapters[index].sections.map((_: void, i: number) => [index, i]) });
  }

  const handleSectionClick = (index: [number, number]) => {
    dispatchSectionSelectionState({ type: 'toggle section selection', indices: [index] });
  }

  return (
    <section className="h-full" data-theme="autumn">
      
      <div className="flex flex-col w-full max-w-7xl m-auto h-full px-2.5">
        <h1 className="text-center text-5xl lg:text-6xl xl:text-7xl">Book Content Selection</h1>
        <div className="divider my-1"></div>

        <form 
          className="h-full overflow-y-auto flex flex-col"
          onSubmit={handleContentSubmit}
        >
          <div className="overflow-y-auto">
            <article className='prose w-full max-w-3xl mx-auto pr-3.5 text-xs md:text-base lg:text-3xl'>
              <ol>
                {chapters.map((chapter: ChapterDetailsType) =>
                  <li key={chapter.number}>
                    <div className="group">
                      <label className="label cursor-pointer">
                        <span className="label-text text-wrap"><strong>{chapter.title}</strong></span>
                        <input 
                          type="checkbox" 
                          className="checkbox checkbox-primary" 
                          checked={sectionSelectionState[chapter.number-1].every((section: boolean) => section)}
                          onChange={() => handleChapterClick(chapter.number-1)}
                        />
                      </label>
                      <div className={`divider my-1 group-hover:divider-primary ${chapterSelectionState.current[chapter.number-1] && 'divider-primary'}`}></div>
                    </div>
                    <ol className="my-1 list-[upper-roman]">
                      {chapter.sections.map((section: SectionDetailsType) =>
                        <li key={section.number}>
                          <label className="label cursor-pointer">
                            <span className="label-text text-wrap">{section.title}</span>
                            <input 
                              type="checkbox"
                              className="checkbox checkbox-sm checkbox-primary" 
                              checked={sectionSelectionState[chapter.number-1][section.number-1]}
                              onChange={() => handleSectionClick([chapter.number-1, section.number-1])}
                            />
                          </label>
                        </li>
                      )}
                    </ol>
                  </li>
                )}
              </ol>
            </article>
          </div>
          <div className="divider my-1"></div>
          <button type="submit" className="btn btn-wide btn-primary self-center my-3" >Generate Book</button>
        </form>
      </div>
      <dialog id="my_modal" className="modal modal-bottom sm:modal-middle" onCancel={e => e.preventDefault()}>
        <div className='modal-box'>
          <BookGenerator chapters={chapters} topic={topic} sectionSelections={sectionSelectionState} />
        </div>
      </dialog>
    </section>
  )
}

// function submitSelectionReducer(_: boolean, action: { type: string }) {
//   switch (action.type) {
//     case 'set true': {
//       return true;
//     }
//     default: {
//       throw new Error(`Unhandled action type: ${action.type}`);
//     }
//   }
// }

function sectionSelectionReducer(draft: boolean[][], action: { type: string; indices: [number, number][]; }) {
  switch (action.type) {
    case 'toggle section selection': {
      draft[action.indices[0][0]][action.indices[0][1]] = !draft[action.indices[0][0]][action.indices[0][1]];
      return;
    }
    case 'set true': {
      action.indices.map((index) => draft[index[0]][index[1]] = true);
      return;
    }
    case 'set false': {
      action.indices.map((index) => draft[index[0]][index[1]] = false);
      return;
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export default BookContentSelector