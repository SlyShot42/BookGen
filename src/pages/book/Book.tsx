import React from 'react';
import { useLocation } from 'react-router-dom';
import { z } from 'zod';
import { SectionDetails, ChapterDetails } from '../landing/Landing';  
// import { useImmerReducer } from 'use-immer';

type ChapterDetailsType = z.infer<typeof ChapterDetails>;
type SectionDetailsType = z.infer<typeof SectionDetails>;

function Book() {
  const location = useLocation();
  const chapters = location.state.tableOfContents;
  // const [chapterSelectionState, dispatchSelectionState] = useImmerReducer(chapterSelectionReducer, Array(chapters.length).fill(false));

  const handleContentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  }

  return (
    <section className="h-full" data-theme="autumn">
      
      <div className="flex flex-col w-full max-w-7xl m-auto h-full px-2.5 md:text-2xl lg:text-3xl xl:text-4xl">
        <h1 className="text-center">Book Content Selection</h1>
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
                        <input type="checkbox" className="checkbox checkbox-primary" />
                      </label>
                      <div className="divider my-1 group-hover:divider-primary"></div>
                    </div>
                    <ol className="my-1 list-[upper-roman]">
                      {chapter.sections.map((section: SectionDetailsType) =>
                        <li key={section.number}>
                          <label className="label cursor-pointer">
                            <span className="label-text text-wrap">{section.title}</span>
                            <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" />
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
          <button className="btn btn-wide btn-primary self-center my-3">Generate Book</button>
        </form>
      </div>
    </section>
  )
}

export default Book