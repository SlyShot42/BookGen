import { createContext } from "react";
import { useImmerReducer } from "use-immer";

export const TopicContext = createContext<string | null>(null);
export const TopicDispatchContext = createContext<React.Dispatch<{
  type: string;
  payload: string;
}> | null>(null);

export function TopicProvider({ children }: { children: React.ReactNode }) {
  const [topic, dispatchTopic] = useImmerReducer(topicReducer, "");

  return (
    <TopicContext.Provider value={topic}>
      <TopicDispatchContext.Provider value={dispatchTopic}>
        {children}
      </TopicDispatchContext.Provider>
    </TopicContext.Provider>
  );
}

const topicReducer = (_: string, action: { type: string; payload: string }) => {
  switch (action.type) {
    case "set":
      return action.payload;
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};
