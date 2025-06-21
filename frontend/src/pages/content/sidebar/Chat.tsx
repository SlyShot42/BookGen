// import { useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useImmerReducer } from "use-immer";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import MyMarkdown from "../../../components/MyMarkdown";
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
    "",
  );

  const mutationIndex = useRef(0);
  const handleTextareaSubmit = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
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
      e.preventDefault();
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
      <div className="flex w-80 max-w-full grow flex-col overflow-y-auto overscroll-none px-4 pt-4 pb-0">
        <section className="h-full grow overflow-y-auto overscroll-none">
          {chatHistory.map((message: ChatCompletionMessageParam, i: number) =>
            message.role === "assistant" ? (
              <div
                key={`${message.role}-${i}`}
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
                      <MyMarkdown
                        content={
                          typeof message.content === "string"
                            ? message.content
                            : ""
                        }
                      />
                    </article>
                  )}
                </div>
              </div>
            ) : message.role === "user" ? (
              <div key={`${message.role}-${i}`} className="chat chat-end">
                <div className="chat-header">You</div>
                <div className="chat-bubble">
                  {typeof message.content === "string" ? message.content : ""}
                </div>
              </div>
            ) : (
              <></>
            ),
          )}
        </section>
      </div>
      <div className="grow-0 p-2 pt-0">
        <form className="size-full" onSubmit={handleButtonSubmit}>
          <div className="join join-horizontal size-full grow-0 p-0">
            <TextareaAutosize
              className="textarea join-item h-auto min-h-0 w-full resize-none"
              placeholder="Ask GPT"
              maxLength={3000}
              minRows={1} // Start at 1 row
              maxRows={3} // Expand up to 3 rows
              value={TextareaState}
              onChange={(e) =>
                dispatchTextareaState({ type: "set", message: e.target.value })
              }
              onKeyDown={(e) => handleTextareaSubmit(e)}
              disabled={mutation.isPending}
              autoFocus
            />
            <button
              type="submit"
              className="btn btn-secondary join-item h-full"
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
  action: { type: string; message?: string },
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
