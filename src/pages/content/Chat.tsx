// import { useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useImmerReducer } from "use-immer";

function Chat({
  chatHistory,
  dispatchChat,
}: {
  chatHistory: { role: string; content: string }[];
  dispatchChat: React.Dispatch<{ type: string; content: string }>;
}) {
  // const contentRef = useRef<string>("");

  const [message, dispatchMessage] = useImmerReducer(messageReducer, "");

  const handleMessageSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (message !== "") {
        dispatchChat({ type: "user message", content: message });
        dispatchMessage({ type: "set", message: "" });
      }
    }
  };
  return (
    <>
      <div className="w-80 max-w-full px-4 pt-4 pb-0 flex flex-col flex-grow overflow-y-auto overscroll-none">
        <section className="h-full overflow-y-auto overscroll-none flex-grow">
          {chatHistory.map(
            (message: { role: string; content: string }, i: number) =>
              message.role === "system" ? (
                <div key={i} className="chat chat-start">
                  <div className="chat-bubble">{message.content}</div>
                </div>
              ) : (
                <div key={i} className="chat chat-end">
                  <div className="chat-bubble">{message.content}</div>
                </div>
              )
          )}
        </section>
      </div>
      <div className="join join-horizontal flex-grow-0 p-2">
        <TextareaAutosize
          className="textarea resize-none w-full join-item"
          placeholder="Ask GPT"
          maxLength={3000}
          maxRows={3}
          value={message}
          onChange={(e) =>
            dispatchMessage({ type: "set", message: e.target.value })
          }
          onKeyDown={(e) => handleMessageSubmit(e)}
        />
        <button className="btn btn-secondary h-full join-item">
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
    </>
  );
}

function messageReducer(
  draft: string,
  action: { type: string; message: string }
) {
  switch (action.type) {
    case "set":
      return action.message;
    default:
      return draft;
  }
}

export default Chat;
