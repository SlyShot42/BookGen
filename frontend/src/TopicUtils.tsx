import { useContext } from "react";
import { TopicContext, TopicDispatchContext } from "./TopicContext";

export const useTopic = () => {
  const topic = useContext(TopicContext);
  if (topic === null) {
    throw new Error("useTopic must be used within a TopicProvider");
  }
  return topic;
};

export const useTopicDispatch = () => {
  const dispatch = useContext(TopicDispatchContext);
  if (dispatch === null) {
    throw new Error("useTopicDispatch must be used within a TopicProvider");
  }
  return dispatch;
};
