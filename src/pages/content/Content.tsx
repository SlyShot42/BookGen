/* eslint-disable @typescript-eslint/no-unused-vars */
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useChapters } from "../../ChaptersUtils";
import { useTopic } from "../../TopicUtils";
import "./mathoverflow.css";
import { useRef } from "react";

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
  const chaptersRef = useRef<Array<HTMLHeadingElement | null>>([]);
  const sectionsRef = useRef<Array<Array<HTMLHeadingElement | null>>>([]);

  const scrollableContainerRef = useRef<HTMLDivElement | null>(null);

  const chapters = useChapters();
  console.log(chapters);
  const topic = useTopic();
  console.log(topic);
  const renderChapter = chapters.map((chapter) =>
    chapter.sections.some((section) => section.content!.trim() !== "")
  );

  const scrollToElement = (element: HTMLElement | null) => {
    if (element && scrollableContainerRef.current) {
      const container = scrollableContainerRef.current;
      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const offset = elementRect.top - containerRect.top + container.scrollTop;

      container.scrollTo({
        top: offset,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className="drawer max-h-screen lg:drawer-open overflow-hidden overscroll-none"
      data-theme="autumn"
    >
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <section className="max-h-screen overflow-clip">
          <div className="max-h-screen flex flex-col w-full max-w-7xl m-auto ">
            <label
              htmlFor="my-drawer-2"
              className="btn btn-circle btn-ghost drawer-button lg:hidden mt-2"
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
            <h1 className="text-center text-4xl lg:text-5xl xl:text-7xl">
              Reading + Problems
            </h1>
            <div className="divider mt-2.5 mb-0"></div>

            <div
              className="overflow-y-auto overscroll-none overflow-x-hidden px-2.5"
              ref={scrollableContainerRef}
            >
              <article className="prose lg:prose-lg xl:prose-xl w-full max-w-3xl mx-auto selection:bg-amber-200 text-pretty">
                {chapters.map(
                  (chapter, i) =>
                    renderChapter[i] && (
                      <div key={i}>
                        <h2
                          ref={(el) => (chaptersRef.current[i] = el)}
                        >{`Ch. ${chapter.number} ${chapter.title}`}</h2>
                        <div className="divider my-1"></div>
                        {chapter.sections.map(
                          (section, j) =>
                            section.content !== "" && (
                              <div key={j}>
                                <h3
                                  ref={(el) => {
                                    if (!sectionsRef.current[i]) {
                                      sectionsRef.current[i] = [];
                                    }
                                    sectionsRef.current[i][j] = el;
                                  }}
                                >{`Sec. ${chapter.number}.${section.number} ${section.title}`}</h3>
                                <div className="divider my-1"></div>
                                <Markdown
                                  remarkPlugins={[remarkMath]}
                                  rehypePlugins={[rehypeKatex]}
                                  children={section.content}
                                  components={{
                                    code(props) {
                                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                      const {
                                        children,
                                        className,
                                        node,
                                        ref,
                                        ...rest
                                      } = props;
                                      const match = /language-(\w+)/.exec(
                                        className || ""
                                      );
                                      return match ? (
                                        <SyntaxHighlighter
                                          {...rest}
                                          PreTag="div"
                                          children={String(children).replace(
                                            /\n$/,
                                            ""
                                          )}
                                          language={match[1]}
                                          style={oneDark}
                                        />
                                      ) : (
                                        <code {...rest} className={className}>
                                          {children}
                                        </code>
                                      );
                                    },
                                  }}
                                />
                              </div>
                            )
                        )}
                      </div>
                    )
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
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
          {chapters.map(
            (chapter, i) =>
              renderChapter[i] && (
                <li key={i}>
                  <details>
                    <summary>
                      <a
                        onClick={() => {
                          scrollToElement(chaptersRef.current[i]);
                        }}
                        className="text-pretty text-inherit"
                      >{`Ch. ${chapter.number} ${chapter.title}`}</a>
                    </summary>
                    <ul>
                      {chapter.sections.map(
                        (section, j) =>
                          section.content !== "" && (
                            <li key={j}>
                              <a
                                onClick={() => {
                                  scrollToElement(sectionsRef.current[i][j]);
                                }}
                                className="text-pretty text-inherit"
                              >{`${chapter.number}.${section.number} ${section.title}`}</a>
                            </li>
                          )
                      )}
                    </ul>
                  </details>
                </li>
              )
          )}
        </ul>
      </div>
    </div>
  );
}

export default Content;
