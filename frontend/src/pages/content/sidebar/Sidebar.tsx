import { useReducer } from "react";
import BookNavigation from "./BookNavigation";
import Chat from "./Chat";
import { JSX } from "react/jsx-runtime";
import { useImmerReducer } from "use-immer";
import { useTopic } from "../../../TopicUtils";
// import { useChapters } from "../../ChaptersUtils";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

function Sidebar(
  props: JSX.IntrinsicAttributes & {
    renderChapter: boolean[];
    chaptersRef: Array<HTMLHeadingElement | null>;
    sectionsRef: Array<Array<HTMLHeadingElement | null>>;
    scrollableContainerRef: React.RefObject<HTMLDivElement>;
  }
) {
  const [toggleDrawerMenu, dispatchToggleDrawerMenu] = useReducer(
    (_: boolean, action: boolean) => action,
    false
  );

  const topic = useTopic();

  const initialChatHistory: ChatCompletionMessageParam[] = [
    {
      role: "developer",
      content: `You are a helpful AI assistant that is determined to help the user learn their topic: ${topic}.`,
    },
    {
      role: "assistant",
      content: `Hello! I am here to help you learn about ${topic}.`,
    },
  ];
  const [chatHistory, dispatchChat] = useImmerReducer(
    chatHistoryReducer,
    initialChatHistory
  );
  // const chapters = useChapters();
  // console.log(chapters[9].sections[0].content);
  return (
    <div className="flex flex-col text-base-content h-full bg-base-200 overscroll-none">
      {toggleDrawerMenu ? (
        <Chat chatHistory={chatHistory} dispatchChat={dispatchChat} />
      ) : (
        <BookNavigation {...props} />
      )}
      <ul className="menu menu-horizontal menu-lg w-full flex bg-accent gap-x-1 grow-0 opacity-100">
        <li className="flex-1" onClick={() => dispatchToggleDrawerMenu(false)}>
          <a className="text-pretty text-inherit hover:text-inherit flex items-center bg-accent opacity-80">
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
                d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
              />
            </svg>
            Doc Nav
          </a>
        </li>
        <li className="flex-1" onClick={() => dispatchToggleDrawerMenu(true)}>
          <a className="text-pretty text-inherit hover:text-inherit flex items-center bg-accent opacity-80">
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
                d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
              />
            </svg>
            AI Chat
          </a>
        </li>
      </ul>
    </div>
  );
}

function chatHistoryReducer(
  draftState: ChatCompletionMessageParam[],
  action: { type: string; content: string; current_message_index?: number }
): void | ChatCompletionMessageParam[] {
  switch (action.type) {
    case "assistant message": {
      if (action.current_message_index === draftState.length - 1) {
        draftState.push({ role: "assistant", content: action.content });
      } else {
        draftState[draftState.length - 1].content += action.content;
      }
      // draftState.push({ role: "assistant", content: action.content });
      break;
    }
    case "user message": {
      draftState.push({ role: "user", content: action.content });
      break;
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
  return draftState;
}

export default Sidebar;
