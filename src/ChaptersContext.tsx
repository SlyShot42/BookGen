import { createContext } from "react";
import { ContentifiedChaptersArrayType } from "./pages/landing/Landing";

export const ChaptersContext = createContext<
  ContentifiedChaptersArrayType | undefined
>(undefined);
