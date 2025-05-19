/* eslint-disable @typescript-eslint/no-unused-vars */
import { useChapters } from "../../ChaptersUtils";
// import { useTopic } from "../../TopicUtils";
import "./mathoverflow.css";
import { useRef } from "react";
import Sidebar from "./sidebar/Sidebar";
import MyMarkdown from "../../components/MyMarkdown";
// import { Problem } from "../landing/Landing";
import ProblemFactory from "../../components/ProblemFactory";

// const markdown = `Here is some ruby code:

// ~~~python
// def greet(name):
//     print(f"Hello, {name}!")

// greet("World")
// ~~~
// `;

function Content() {
  // const markdown = `
  // # Sample Markdown
  // \`\`\`javascript
  // console.log('Hello, world!');
  // \`\`\`
  // `;

  // console.log(toggleDrawerMenu);
  const chaptersRef = useRef<Array<HTMLHeadingElement | null>>([]);
  const sectionsRef = useRef<Array<Array<HTMLHeadingElement | null>>>([]);

  const scrollableContainerRef = useRef<HTMLDivElement | null>(null);

  const chapters = useChapters();
  // console.log(chapters);
  // const topic = useTopic();
  // console.log(topic);
  const renderChapter = chapters.map((chapter) =>
    chapter.sections.some((section) => section.content.article.trim() !== ""),
  );

  return (
    <div
      className="drawer lg:drawer-open max-h-screen overflow-hidden overscroll-none"
      data-theme="autumn"
    >
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <section className="max-h-screen overflow-clip">
          <div className="m-auto flex max-h-screen w-full max-w-7xl flex-col">
            <label
              htmlFor="my-drawer-2"
              className="btn btn-circle btn-ghost drawer-button mt-2 lg:hidden"
            >
              <svg
                className="swap-off fill-current"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 512 512"
              >
                <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
              </svg>
            </label>
            <h1 className="text-center text-5xl lg:text-6xl xl:text-7xl">
              BookGen&#128214;
            </h1>
            <div className="divider mt-2.5 mb-0 h-0"></div>

            <div
              className="overflow-x-hidden overflow-y-auto overscroll-none px-2.5"
              ref={scrollableContainerRef}
            >
              <article className="prose lg:prose-lg xl:prose-xl mx-auto w-full max-w-3xl text-pretty selection:bg-amber-200">
                {chapters.map(
                  (chapter, i) =>
                    renderChapter[i] && (
                      <div key={i}>
                        <h2
                          ref={(el) => (chaptersRef.current[i] = el)}
                          className="my-2 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-4xl font-extrabold text-transparent selection:bg-amber-200 selection:text-black lg:text-5xl xl:text-6xl"
                        >{`Ch. ${chapter.number} ${chapter.title}`}</h2>
                        {/* <div className="divider my-1 h-0"></div> */}
                        {chapter.sections.map(
                          (section, j) =>
                            section.content.article !== "" && (
                              <div key={j}>
                                <h3
                                  ref={(el) => {
                                    if (!sectionsRef.current[i]) {
                                      sectionsRef.current[i] = [];
                                    }
                                    sectionsRef.current[i][j] = el;
                                  }}
                                  className="text-secondary my-4 text-2xl font-bold selection:bg-amber-200 selection:text-black lg:text-3xl xl:text-4xl"
                                >{`Sec. ${chapter.number}.${section.number} ${section.title}`}</h3>
                                {/* <div className="divider my-1 h-0"></div> */}
                                <MyMarkdown content={section.content.article} />
                                {section.content.problems.map((problem, k) => (
                                  <ProblemFactory
                                    key={k}
                                    problem={problem}
                                    sectionIndex={j}
                                    problemIndex={k}
                                  />
                                ))}
                              </div>
                            ),
                        )}
                      </div>
                    ),
                )}
              </article>
            </div>
          </div>
        </section>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
        />
        <Sidebar
          renderChapter={renderChapter}
          chaptersRef={chaptersRef.current}
          sectionsRef={sectionsRef.current}
          scrollableContainerRef={scrollableContainerRef}
        />
      </div>
    </div>
  );
}

export default Content;
