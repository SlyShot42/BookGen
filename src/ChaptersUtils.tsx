import { useContext } from "react";
import { ChaptersContext, ChaptersDispatchContext } from "./ChaptersContext";

export const useChapters = () => {
  const chapters = useContext(ChaptersContext);
  if (chapters === null) {
    throw new Error("useChapters must be used within a ChaptersProvider");
  }
  return chapters;
};

export const useChaptersDispatch = () => {
  const dispatch = useContext(ChaptersDispatchContext);
  if (dispatch === null) {
    throw new Error(
      "useChaptersDispatch must be used within a ChaptersProvider"
    );
  }
  return dispatch;
};
