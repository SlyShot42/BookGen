import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const markdown = `Here is some ruby code:

~~~python
def greet(name):
    print(f"Hello, {name}!")

greet("World")
~~~
`;

function Content() {
  // const markdown = `
  // # Sample Markdown
  // \`\`\`javascript
  // console.log('Hello, world!');
  // \`\`\`
  // `;
  return (
    <div className="drawer h-full lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content h-full">
        <section className="h-full" data-theme="autumn">
          <div className="flex flex-col w-full max-w-7xl m-auto h-full px-2.5">
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
            <div className="divider my-1"></div>

            <div className="overflow-y-auto">
              <article className="prose w-full max-w-3xl mx-auto">
                <Markdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  children={markdown}
                  components={{
                    code(props) {
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const { children, className, node, ref, ...rest } = props;
                      const match = /language-(\w+)/.exec(className || "");
                      return match ? (
                        <SyntaxHighlighter
                          {...rest}
                          PreTag="div"
                          children={String(children).replace(/\n$/, "")}
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
        ></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
          {/* Sidebar content here */}
          <li>
            <a>Sidebar Item 1</a>
          </li>
          <li>
            <a>Sidebar Item 2</a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Content;
