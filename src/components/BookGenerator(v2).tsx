import OpenAI from "openai";
// import { useImmerReducer } from "use-immer";
// import { z } from "zod";
// import { useCallback, useEffect, useRef } from "react";
import { useQueries } from "@tanstack/react-query";
import { useChapters, useChaptersDispatch } from "../ChaptersUtils";
import { useTopic } from "../TopicUtils";
import { useEffect } from "react";
import { unstable_batchedUpdates } from "react-dom";
import { useNavigate } from "react-router-dom";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";
import {
  Problem,
  ProblemType,
  ContentDetailsType,
} from "../pages/landing/Landing";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

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
  const navigate = useNavigate();

  useEffect(() => {
    if (progress === maxProgress) {
      unstable_batchedUpdates(() => {
        combinedQueries.contentArray.forEach((positionContent) => {
          chaptersDispatch({
            type: "add_section_content",
            sectionIndex: [
              positionContent.chapterIndex,
              positionContent.sectionIndex,
            ],
            content: positionContent.content,
          });
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

  const markdownFormatting = (text: string) => {
    return text
      .replace(/\\\[(.*?)\\\]/gs, "$$$$" + "$1" + "$$$$")
      .replace(/\\\((.*?)\\\)/gs, function (_, p1) {
        return "$" + p1 + "$";
      });
  };

  const generateBook = async (position: number[]) => {
    const chapterIndex = position[0];
    const sectionIndex = position[1];
    // const chapterTitle = chapters[chapterIndex].title;
    const sectionTitle = chapters[chapterIndex].sections[sectionIndex].title;
    const markdownResponse = await openai.chat.completions.create({
      model: "gpt-4o-2024-11-20",
      messages: [
        {
          role: "developer",
          content: `You are a course textbook content generation machine designed to output in markdown(surround inline latex with $..$ and display latex with $$..$$). Do not acknowledge or greet. Output the content only. Expand on information where appropriate.`,
        },
        {
          role: "user",
          content: `Generate the content of the section (do not include section title in reponse): \n${sectionTitle}\n in the\n${topic}\n textbook.`,
        },
      ],
      temperature: 0.4,
    });
    console.log(`${chapterIndex + 1}.${sectionIndex + 1}`);
    const article = markdownFormatting(
      markdownResponse.choices[0].message.content!,
    );
    console.log(article);

    const examples = `Problems: [
            {
                code: "MCQ",
                statement: "What is the capital of France?",
                options: ["Paris", "London", "Berlin", "Madrid"],
                answerIndex: 0
            },
            {
                code: "FRQ",
                statement: "Describe Elon Musk.",
                answer: "Elon Musk (b. 28 June 1971) is a South-African-born American entrepreneur and engineer best known as the CEO of Tesla, founder & chief engineer of SpaceX, and owner of X Corp. (formerly Twitter); he has also co-founded ventures such as Neuralink, The Boring Company and xAI."
            },
            {
                code: "CODE",
                statement: "Complete the function add(a,b) that returns the sum of two numbers",
                setup: "def add(a, b): \n\t# your code here",
                correctCode: "def add(a, b): \n\treturn a + b",
                testCases: ["print(add(1, 2) == 3)", "print(add(-1, 1) == 0)", "print(add(0, 0) == 0)"],
            }
        ]`;

    const numProblems = 2;
    const generatedProblems = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-11-20",
      messages: [
        {
          role: "system",
          content: `You are a course textbook problem generation machine designed to output in JSON in the format: \n
            ${examples}
            \nUse markdown(surround any inline latex math expressions with $..$ and display latex math expressions with $$..$$) for statement field. The setup field for any CODE problem is to contain only setup code for the problem and nothing else. For the code problem statement, include any and all necessary information for the user to understand the problem along with the functions and variables to be used in the testcases. Ensure that correct code generated adheres strictly to the structure layed out in the setup code. Similarly, ensure that each testcase can run independently when appended to the correct code individually. LEAVE NO ROOM FOR AMBIGUITY.`,
        },
        {
          role: "user",
          content: `Generate exactly ${numProblems} problems of random types for the section: \n ${sectionTitle} \n in the ${topic} textbook.
            \nreferencing the section content\n
            ${article}`,
        },
      ],
      response_format: zodResponseFormat(
        z.object({
          Problems: z.array(Problem),
        }),
        "Problems",
      ),
      seed: 138,
      temperature: 0.2,
    });

    console.log(generatedProblems.choices[0].message.parsed?.Problems);

    generatedProblems.choices[0].message.parsed?.Problems.forEach(
      (problem: ProblemType) => {
        problem.statement = markdownFormatting(problem.statement);
        switch (problem.code) {
          case "FRQ":
            problem.answer = markdownFormatting(problem.answer);
            break;
          case "MCQ":
            problem.options = problem.options.map((option: string) => {
              return markdownFormatting(option);
            });
            break;
          default:
            break;
        }
      },
    );

    const content: ContentDetailsType = {
      article: article,
      problems: generatedProblems.choices[0].message.parsed?.Problems ?? [],
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
