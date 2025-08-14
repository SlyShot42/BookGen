// import OpenAI from "openai";
// import { useImmerReducer } from "use-immer";
// import { z } from "zod";
// import { useCallback, useEffect, useRef } from "react";
import { useQueries } from "@tanstack/react-query";
import { useChapters, useChaptersDispatch } from "../ChaptersUtils";
import { useTopic } from "../TopicUtils";
import { useEffect } from "react";
import { unstable_batchedUpdates } from "react-dom";
import { useNavigate } from "react-router-dom";
// import { zodResponseFormat } from "openai/helpers/zod.mjs";
// import { z } from "zod";
import {
  // Problem,
  // ProblemType,
  ContentDetailsType,
} from "../pages/landing/Landing";

// const openai = new OpenAI({
//   apiKey: import.meta.env.VITE_OPENAI_API_KEY,
//   dangerouslyAllowBrowser: true,
// });

function BookGenerator({ selections }: { selections?: [number, number][] }) {
  const chapters = useChapters();
  const chaptersDispatch = useChaptersDispatch();
  const sectionSelections: [number, number][] = selections ?? [];

  if (sectionSelections.length === 0) {
    chapters.forEach((chapter, i) => {
      chapter.sections.forEach((_, j) => {
        sectionSelections.push([i, j]);
      });
    });
  }
  const topic = useTopic();

  const combinedQueries = useQueries({
    queries: sectionSelections.map((position) => {
      return {
        queryKey: ["generateSection", position],
        queryFn: () => generateBook(position),
        staleTime: Infinity,
        // retry: 1, // Only retry once on failure
        // retryDelay: 1000, // Wait 1 second before retrying
      };
    }),
    combine: (results) => {
      return {
        contentArray: results.map((result, i) => {
          return {
            content: result.data,
            chapterIndex: sectionSelections[i][0],
            sectionIndex: sectionSelections[i][1],
            error: result.error,
            isError: result.isError,
          };
        }),
        progress: results.filter((result) => result.isSuccess).length,
      };
    },
  });

  const progress = combinedQueries.progress;
  const maxProgress = sectionSelections.length;
  const navigate = useNavigate();

  useEffect(() => {
    if (progress === maxProgress) {
      unstable_batchedUpdates(() => {
        combinedQueries.contentArray.forEach((positionContent) => {
          if (positionContent.isError) {
            console.error("Error generating content:", positionContent.error);
          } else {
            chaptersDispatch({
              type: "add_section_content",
              sectionIndex: [
                positionContent.chapterIndex,
                positionContent.sectionIndex,
              ],
              content: positionContent.content,
            });
          }
        });
      });
      navigate("/content");
    }
  }, [
    progress,
    maxProgress,
    combinedQueries.contentArray,
    chaptersDispatch,
    navigate,
  ]);

  const generateBook = async (position: number[]) => {
    const chapterIndex = position[0];
    const sectionIndex = position[1];
    // const chapterTitle = chapters[chapterIndex].title;
    const sectionTitle = chapters[chapterIndex].sections[sectionIndex].title;
    console.log(`${chapterIndex + 1}.${sectionIndex + 1}`);
    const numProblems = 2;

    const res = await fetch(
      "https://kzaivdzthdp7fqhblzcmrpdevi0pgxmv.lambda-url.us-west-1.on.aws/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic,
          sectionTitle: sectionTitle,
          numProblems: numProblems,
        }),
      },
    );
    if (!res.ok) {
      throw new Error(
        `Failed to generate content: ${res.status} ${res.statusText}`,
      );
    }
    const response = await res.json();

    const content: ContentDetailsType = {
      article: response.article,
      problems: response.problems,
    };

    return content;
  };

  return (
    <>
      <h1>Generating Book</h1>
      <progress
        className="progress progress-primary w-full"
        value={progress}
        max={maxProgress}
      />
      <p>
        {progress}/{maxProgress}
      </p>
    </>
  );
}

export default BookGenerator;
