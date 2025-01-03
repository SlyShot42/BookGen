import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
// import { useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useImmerReducer } from "use-immer";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
// import { useEffect } from "react";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function Chat({
  chatHistory,
  dispatchChat,
}: {
  chatHistory: ChatCompletionMessageParam[];
  dispatchChat: React.Dispatch<{
    type: string;
    content: string;
    current_message_index?: number;
  }>;
}) {
  // const contentRef = useRef<string>("");
  // function useMutations(mutations) {
  //   return mutations.map((mutation) => {
  //     return useMutation({
  //       mutationFn: mutation.mutationFn,
  //     });
  //   });
  // }
  const mutation = useMutation({
    mutationFn: async (updatedChatHistory: ChatCompletionMessageParam[]) => {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: updatedChatHistory,
        stream: true,
      });

      for await (const chunk of completion) {
        dispatchChat({
          type: "assistant message",
          content: chunk.choices[0].delta.content ?? "",
          current_message_index: updatedChatHistory.length - 1,
        });
      }
    },
    onSuccess: () => {
      console.log("AI response successfully processed.");
    },
    onError: (error: Error) => {
      console.error("Error fetching AI response:", error);
      // Optionally, notify the user about the error
    },
  });

  const [TextareaState, dispatchTextareaState] = useImmerReducer(
    textareaStateReducer,
    ""
  );

  const mutationIndex = useRef(0);
  const handleTextareaSubmit = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (TextareaState !== "") {
        dispatchChat({ type: "user message", content: TextareaState });
        dispatchTextareaState({ type: "clear state" });
        // refetch();
        const updatedChatHistory: ChatCompletionMessageParam[] = [
          ...chatHistory,
          { role: "user", content: TextareaState },
        ];
        mutationIndex.current = updatedChatHistory.length - 1;
        mutation.mutate(updatedChatHistory);
      }
    } else if (e.key === "Enter" && e.shiftKey) {
      // Allow Shift + Enter to create a new line
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + "\n" + value.substring(end);
      dispatchTextareaState({ type: "set", message: newValue });
      // Move the cursor to the correct position after the newline
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  const handleButtonSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (TextareaState !== "") {
      dispatchChat({ type: "user message", content: TextareaState });
      dispatchTextareaState({ type: "clear state" });
      // refetch();
      const updatedChatHistory: ChatCompletionMessageParam[] = [
        ...chatHistory,
        { role: "user", content: TextareaState },
      ];
      mutationIndex.current = updatedChatHistory.length - 1;
      mutation.mutate(updatedChatHistory);
    }
  };
  return (
    <>
      <div className="w-80 max-w-full px-4 pt-4 pb-0 flex flex-col flex-grow overflow-y-auto overscroll-none">
        <section className="h-full overflow-y-auto overscroll-none flex-grow">
          {chatHistory.map((message: ChatCompletionMessageParam, i: number) =>
            message.role === "assistant" ? (
              <div
                key={i}
                className={
                  i === chatHistory.length - 1
                    ? "chat chat-start pb-2"
                    : "chat chat-start"
                }
              >
                <div className="chat-header">AI Assistant</div>
                <div className="chat-bubble">
                  {mutation.isPending && i === mutationIndex.current ? (
                    <span className="loading loading-dots loading-sm"></span>
                  ) : (
                    <article>
                      <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        children={
                          typeof message.content === "string"
                            ? message.content
                            : ""
                        }
                        components={{
                          code(props) {
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const {
                              children,
                              className,
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              node,
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
                  )}
                </div>
              </div>
            ) : message.role === "user" ? (
              <div key={i} className="chat chat-end">
                <div className="chat-header">You</div>
                <div className="chat-bubble">
                  {typeof message.content === "string" ? message.content : ""}
                </div>
              </div>
            ) : (
              <></>
            )
          )}
        </section>
      </div>
      <div className="join join-horizontal flex-grow-0 p-2 pt-0">
        <form className="size-full" onSubmit={handleButtonSubmit}>
          <div className="join join-horizontal size-full flex-grow-0 p-0">
            <TextareaAutosize
              className="input textarea resize-none w-full join-item"
              placeholder="Ask GPT"
              maxLength={3000}
              maxRows={3}
              value={TextareaState}
              onChange={(e) =>
                dispatchTextareaState({ type: "set", message: e.target.value })
              }
              onKeyDown={(e) => handleTextareaSubmit(e)}
              disabled={mutation.isPending}
            />
            <button
              type="submit"
              className="btn btn-secondary h-full join-item"
              disabled={mutation.isPending}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function textareaStateReducer(
  draft: string,
  action: { type: string; message?: string }
) {
  switch (action.type) {
    case "set":
      return action.message;
    case "clear state":
      return "";
    default:
      return draft;
  }
}

export default Chat;
