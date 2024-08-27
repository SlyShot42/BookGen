import OpenAI from "openai";
// import { useImmerReducer } from "use-immer";
import { z } from "zod";
import { ChapterDetails } from "../pages/landing/Landing";
// import { useCallback, useEffect, useRef } from "react";
import { useQueries } from "@tanstack/react-query";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

type ChapterDetailsType = z.infer<typeof ChapterDetails>;

function BookGenerator({
  chapters,
  topic,
  sectionSelections,
}: {
  chapters: ChapterDetailsType[];
  topic: string;
  sectionSelections: [number, number][];
}) {
  const combinedQueries = useQueries({
    queries: sectionSelections.map((position) => {
      return {
        queryKey: ["generateSection", position],
        queryFn: () => generateBook(position),
        staleTime: Infinity,
      };
    }),
    combine: (results) => {
      return {
        contentArray: results.map((result, i) => {
          return {
            content: result.data,
            chapterIndex: sectionSelections[i][0],
            sectionIndex: sectionSelections[i][1],
          };
        }),
        progress: results.filter((result) => result.isSuccess).length,
      };
    },
  });

  const progress = combinedQueries.progress;
  const maxProgress = sectionSelections.length;

  // const [progress, dispatchProgress] = useImmerReducer(progressReducer, 0);
  // const sectionContent = useRef(
  //   chapters!.map((chapter: ChapterDetailsType) =>
  //     Array(chapter.sections.length).fill("")
  //   )
  // );
  // const maxProgress = sectionSelections.length;
  // const calls = useRef(0);

  const generateBook = async (position: number[]) => {
    const chapterIndex = position[0];
    const sectionIndex = position[1];
    // const chapterTitle = chapters[chapterIndex].title;
    const sectionTitle = chapters[chapterIndex].sections[sectionIndex].title;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content:
            "You are a course textbook content generation machine designed to output in markdown(surround inline latex with $..$ and display latex with $$..$$). Do not acknowledge or greet. Output the content only. Expand on information where appropriate.",
        },
        {
          role: "user",
          content:
            "Generate the content of the section (do not include section title in reponse): \n" +
            sectionTitle +
            "\n in the\n" +
            topic +
            "\n textbook.",
        },
      ],
      temperature: 0.4,
    });
    console.log(`${chapterIndex + 1}.${sectionIndex + 1}`);
    console.log(completion.choices[0].message.content);
    return completion.choices[0].message.content;
  };
  // useEffect(() => {
  //   let ignore = false;
  //   if (progress < maxProgress) {
  //     generateBook(sectionSelections[progress], ignore);
  //   } else {
  //     const fillCheck = sectionContent.current
  //       .flat()
  //       .every((content) => content !== "");
  //     console.log(fillCheck);
  //   }
  //   return () => {
  //     ignore = true;
  //   };
  // }, [generateBook, maxProgress, progress, sectionSelections]);

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

// const progressReducer = (draft: number, action: { type: string }) => {
//   switch (action.type) {
//     case "increment":
//       draft += 1;
//       return draft;
//     default:
//       return draft;
//   }
// };

export default BookGenerator;
