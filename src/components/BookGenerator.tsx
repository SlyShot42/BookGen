import OpenAI from "openai";
import { useImmerReducer } from "use-immer";
import { ContentifiedChapterDetails } from "../pages/landing/Landing";
import { useEffect } from "react";
import { useRef } from "react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

type ContentifiedChapterDetailsType = z.infer<
  typeof ContentifiedChapterDetails
>;
// type ChapterDetailsType = z.infer<typeof ChapterDetails>;

function BookGenerator({
  chapters,
  topic,
  sectionSelections = null,
}: {
  chapters: ContentifiedChapterDetailsType[] | null;
  topic: string;
  sectionSelections?: boolean[][] | null;
}) {
  const navigate = useNavigate();

  const totalSections = chapters!.reduce(
    (accumulator, currentValue) => accumulator + currentValue.sections.length,
    0
  );

  // compute max progress by totalling the trues in sectionSelections or using totalSections
  const maxProgress = sectionSelections
    ? sectionSelections
        .flat()
        .reduce(
          (accumulator, currentValue) => accumulator + Number(currentValue),
          0
        )
    : totalSections;

  // const [progress, dispatchProgress] = useImmerReducer(
  //   progressReducer,
  //   0
  // );

  const progress = useRef(0);
  const sectionContent = useRef(
    chapters!.map((chapter: ContentifiedChapterDetailsType) =>
      Array(chapter.sections.length).fill("")
    )
  );
  // const currentIndex = useRef([0, 0]);
  const [currentIndex, dispatchCurrentIndex] = useImmerReducer(
    currentIndexReducer,
    [0, 0]
  );
  // let sectionIndex = currentIndex.current[1];
  // let chapterIndex = currentIndex.current[0];

  useEffect(() => {
    const generateContent = async (title: string) => {
      let content: string | null = "";
      try {
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
                title +
                "\n in the\n" +
                topic +
                "\n textbook.",
            },
          ],
          temperature: 0.4,
        });
        // console.log(completion.choices[0].message.content);
        content = completion.choices[0].message.content;
      } catch (error) {
        console.error("Error fetching completion", error);
      } finally {
        progress.current += 1;
        const [chapterIndex, sectionIndex] = currentIndex;
        if (sectionIndex < chapters![chapterIndex].sections.length - 1) {
          dispatchCurrentIndex({ type: "increment section" });
        } else if (chapterIndex < chapters!.length) {
          dispatchCurrentIndex({ type: "increment chapter" });
        }
        // console.log(currentIndex);
      }
      return content;
    };

    if (progress.current < maxProgress) {
      const [chapterIndex, sectionIndex] = currentIndex;
      if (sectionSelections) {
        console.log(chapterIndex, sectionIndex);
        console.log(sectionSelections[chapterIndex][sectionIndex]);
        if (sectionSelections[chapterIndex][sectionIndex]) {
          sectionContent.current[chapterIndex][sectionIndex] = generateContent(
            chapters![chapterIndex].sections[sectionIndex].title
          );
        }
      } else {
        console.log(chapterIndex, sectionIndex);
        console.log(
          chapters![chapterIndex].sections.length - 1,
          chapters!.length
        );
        sectionContent.current[chapterIndex][sectionIndex] = generateContent(
          chapters![chapterIndex].sections[sectionIndex].title
        );
      }

      if (sectionContent.current[chapterIndex][sectionIndex] === "") {
        if (sectionIndex < chapters![chapterIndex].sections.length) {
          dispatchCurrentIndex({ type: "increment section" });
        } else if (chapterIndex < chapters!.length) {
          dispatchCurrentIndex({ type: "increment chapter" });
        }
        // console.log(currentIndex);
      }
    }

    // else {
    //   navigate("/content", {
    //     state: { chapters, sectionContent: sectionContent.current },
    //   });
    // }
    console.log("end of useEffect");
  }, [
    chapters,
    currentIndex,
    dispatchCurrentIndex,
    maxProgress,
    topic,
    navigate,
    sectionSelections,
  ]);

  return (
    <>
      <h1>Generating Book</h1>
      <progress
        className="progress progress-primary w-full"
        value={progress.current}
        max={maxProgress}
      />
      <p>
        {progress.current}/{maxProgress}
      </p>
    </>
  );
}

// const progressReducer = (draft: number, action: { type: string }) => {
//   switch (action.type) {
//     case "increment":
//       return draft + 1;
//     default:
//       return;
//   }
// };

const currentIndexReducer = (draft: number[], action: { type: string }) => {
  switch (action.type) {
    case "increment section":
      draft[1] += 1;
      return draft;
    case "increment chapter":
      draft[0] += 1;
      draft[1] = 0;
      return draft;
    default:
      return draft;
  }
};

export default BookGenerator;
