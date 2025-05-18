import React from "react";
// import SelectionCards from "./SelectionCards";
// import {useState} from 'react';
// import { useEffect } from "react";
// import { ChangeEvent } from "react";
// import { useRef } from "react";
import { useImmerReducer } from "use-immer";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { useNavigate } from "react-router-dom";
// import TextareaAutosize from "react-textarea-autosize";
import BookGenerator from "../../components/BookGenerator(v2)";
import { useMutation } from "@tanstack/react-query";
import { useChaptersDispatch } from "../../ChaptersUtils";
import { useTopic, useTopicDispatch } from "../../TopicUtils";
// import dotenv from 'dotenv';
// dotenv.config();
// console.log(process.env);
// import * as dotenv from 'dotenv';
// dotenv.config();

const SectionDetails = z.object({
  number: z.number(),
  title: z.string(),
});

const ChapterDetails = z.object({
  number: z.number(),
  title: z.string(),
  sections: z.array(SectionDetails),
});

const ChaptersArray = z.array(ChapterDetails);

type ChapterDetailsType = z.infer<typeof ChapterDetails>;
type SectionDetailsType = z.infer<typeof SectionDetails>;

const FreeResponse = z.object({
  code: z.literal("FRQ"),
  statement: z.string(),
  answer: z.string(),
});

const MultipleChoice = z.object({
  code: z.literal("MCQ"),
  statement: z.string(),
  options: z.array(z.string()),
  answer: z.string(),
});

const Code = z.object({
  code: z.literal("CODE"),
  statement: z.string(),
  setup: z.string(),
  correctCode: z.string(),
  testCases: z.array(z.string()),
});

export const Problem = z.union([FreeResponse, MultipleChoice, Code]);

const ContentDetails = z.object({
  article: z.string(),
  problems: z.array(Problem),
});

const ContentifiedSectionDetails = SectionDetails.extend({
  content: ContentDetails,
});

const ContentifiedChapterDetails = ChapterDetails.extend({
  sections: z.array(ContentifiedSectionDetails),
});

const ContentifiedChaptersArray = z.array(ContentifiedChapterDetails);

type ContentifiedChaptersArrayType = z.infer<typeof ContentifiedChaptersArray>;

type ProblemType = z.infer<typeof Problem>;
type MultipleChoiceType = z.infer<typeof MultipleChoice>;
type FreeResponseType = z.infer<typeof FreeResponse>;
type CodeType = z.infer<typeof Code>;

type ContentDetailsType = z.infer<typeof ContentDetails>;

type ContentifiedSectionDetailsType = z.infer<
  typeof ContentifiedSectionDetails
>;
type ContentifiedChapterDetailsType = z.infer<
  typeof ContentifiedChapterDetails
>;

// type ChapterDetailsType = z.infer<typeof ChapterDetails>;
// type sectionDetailsType = z.infer<typeof SectionDetails>;

const TableOfContents = z.object({
  chapters: ChaptersArray,
});

// export { SectionDetails, ChapterDetails };
export type {
  ProblemType,
  MultipleChoiceType,
  FreeResponseType,
  CodeType,
  ContentDetailsType,
  ContentifiedSectionDetailsType,
  ContentifiedChapterDetailsType,
  ContentifiedChaptersArrayType,
};

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function Landing() {
  // const [topic, dispatchTopic] = useImmerReducer(topicReducer, "");
  const topic = useTopic();
  const dispatchTopic = useTopicDispatch();
  // const [loading, dispatchLoad] = useImmerReducer(loadingReducer, false);
  const [generateFull, dispatchGenerateFull] = useImmerReducer(
    generateFullReducer,
    false,
  );
  // const chapters = useRef<ChapterDetailsType[] | null>(null);

  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-11-20",
        messages: [
          {
            role: "developer",
            content: "You are a course textbook writing expert",
          },
          {
            role: "user",
            content: `Generate the table of contents (include chapter and sections) for a textbook on ${topic}`,
          },
        ],
        response_format: zodResponseFormat(
          TableOfContents,
          "table_of_contents",
        ),
      });

      const data = completion.choices[0].message.parsed?.chapters;

      const temp = data!.map((chapter: ChapterDetailsType, index: number) => {
        return {
          ...chapter,
          number: index + 1,
          sections: chapter.sections.map(
            (section: SectionDetailsType, i: number) => {
              return {
                ...section,
                number: i + 1,
                content: {
                  article: "",
                  problems: [],
                },
              };
            },
          ),
        };
      });
      dispatchChapters({ type: "initialize", payload: temp });
    },
    onSuccess: () => {
      console.log("AI response successfully processed.");
      (document.getElementById("my_modal") as HTMLDialogElement)?.showModal();
    },
    onError: (error: Error) => {
      console.error("Error fetching AI response:", error);
      // Optionally, notify the user about the error
    },
  });

  const dispatchChapters = useChaptersDispatch();
  const handleTopicSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate();
  };

  const handleFullGenerate = () => {
    dispatchGenerateFull({ type: "set generate full" });
  };

  const handleContentSelection = () => {
    navigate("/book");
  };

  return (
    <section className="flex min-h-screen flex-col" data-theme="autumn">
      <div className="flex h-full flex-1 flex-col">
        <div className="m-auto flex h-full w-full max-w-xl flex-col px-2.5">
          <h1 className="text-center text-5xl lg:text-6xl xl:text-7xl">
            BookGen&#128214;
          </h1>
          <div className="divider my-1"></div>

          {/* there probably needs to be handler function here for the form submission */}
          <form
            className="flex h-full flex-col space-y-4 px-2.5"
            onSubmit={handleTopicSubmit}
          >
            <label className="hidden">Enter Topic:</label>
            <textarea
              className="textarea textarea-primary textarea-md text-neutral h-72 w-full resize-none font-mono font-bold md:h-62 lg:h-52 landscape:h-24"
              placeholder="Enter a topic you want to study..."
              onChange={(e) =>
                dispatchTopic({ type: "set", payload: e.target.value })
              }
              value={topic}
              autoFocus
            />
            <button
              type="submit"
              className="btn btn-wide btn-primary self-center"
              disabled={topic === ""}
            >
              {mutation.isPending ? (
                <>
                  Generating<span className="loading loading-spinner"></span>
                </>
              ) : (
                "Generate Table of Contents"
              )}
            </button>
          </form>
          {/* <h1>{topic}</h1> */}
        </div>
      </div>
      {/* XS only: centered */}
      <footer className="footer footer-center bg-neutral text-neutral-content block items-center p-4 sm:hidden">
        <aside className="grid-flow-col items-center">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fillRule="evenodd"
            clipRule="evenodd"
            className="fill-current"
          >
            <path d="M22.672 15.226l-2.432.811.841 2.515c.33 1.019-.209 2.127-1.23 2.456-1.15.325-2.148-.321-2.463-1.226l-.84-2.518-5.013 1.677.84 2.517c.391 1.203-.434 2.542-1.831 2.542-.88 0-1.601-.564-1.86-1.314l-.842-2.516-2.431.809c-1.135.328-2.145-.317-2.463-1.229-.329-1.018.211-2.127 1.231-2.456l2.432-.809-1.621-4.823-2.432.808c-1.355.384-2.558-.59-2.558-1.839 0-.817.509-1.582 1.327-1.846l2.433-.809-.842-2.515c-.33-1.02.211-2.129 1.232-2.458 1.02-.329 2.13.209 2.461 1.229l.842 2.515 5.011-1.677-.839-2.517c-.403-1.238.484-2.553 1.843-2.553.819 0 1.585.509 1.85 1.326l.841 2.517 2.431-.81c1.02-.33 2.131.211 2.461 1.229.332 1.018-.21 2.126-1.23 2.456l-2.433.809 1.622 4.823 2.433-.809c1.242-.401 2.557.484 2.557 1.838 0 .819-.51 1.583-1.328 1.847m-8.992-6.428l-5.01 1.675 1.619 4.828 5.011-1.674-1.62-4.829z"></path>
          </svg>
          <p>Copyright © {new Date().getFullYear()} - All rights reserved</p>
        </aside>
        {/* <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
          <a>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
            </svg>
          </a>
          <a>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
            </svg>
          </a>
          <a>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
            </svg>
          </a>
        </nav> */}
      </footer>

      {/* SM and up: horizontal */}
      <footer className="footer footer-horizontal bg-neutral text-neutral-content hidden items-center p-4 sm:flex">
        <aside className="grid-flow-col items-center">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fillRule="evenodd"
            clipRule="evenodd"
            className="fill-current"
          >
            <path d="M22.672 15.226l-2.432.811.841 2.515c.33 1.019-.209 2.127-1.23 2.456-1.15.325-2.148-.321-2.463-1.226l-.84-2.518-5.013 1.677.84 2.517c.391 1.203-.434 2.542-1.831 2.542-.88 0-1.601-.564-1.86-1.314l-.842-2.516-2.431.809c-1.135.328-2.145-.317-2.463-1.229-.329-1.018.211-2.127 1.231-2.456l2.432-.809-1.621-4.823-2.432.808c-1.355.384-2.558-.59-2.558-1.839 0-.817.509-1.582 1.327-1.846l2.433-.809-.842-2.515c-.33-1.02.211-2.129 1.232-2.458 1.02-.329 2.13.209 2.461 1.229l.842 2.515 5.011-1.677-.839-2.517c-.403-1.238.484-2.553 1.843-2.553.819 0 1.585.509 1.85 1.326l.841 2.517 2.431-.81c1.02-.33 2.131.211 2.461 1.229.332 1.018-.21 2.126-1.23 2.456l-2.433.809 1.622 4.823 2.433-.809c1.242-.401 2.557.484 2.557 1.838 0 .819-.51 1.583-1.328 1.847m-8.992-6.428l-5.01 1.675 1.619 4.828 5.011-1.674-1.62-4.829z"></path>
          </svg>
          <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
        </aside>
        {/* <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
          <a>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
            </svg>
          </a>
          <a>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
            </svg>
          </a>
          <a>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
            </svg>
          </a>
        </nav> */}
      </footer>
      <dialog
        id="my_modal"
        className="modal modal-bottom sm:modal-middle"
        onCancel={(e) => e.preventDefault()}
      >
        <div className="modal-box">
          {generateFull ? (
            <BookGenerator />
          ) : (
            <>
              <h3 className="text-lg font-bold">
                How much of your book do you want to generate?
              </h3>
              <p className="py-4">
                *Note: Generating a full book can take long depending on the
                number of sections in your book.
              </p>
              <div className="modal-action">
                <form
                  method="dialog"
                  className="flex w-full flex-col justify-around space-y-2 md:flex-row md:space-y-0"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <button
                    className="btn btn-primary"
                    onClick={handleFullGenerate}
                  >
                    Generate Full Book
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleContentSelection}
                  >
                    Go to Content Selection
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </dialog>
    </section>
  );
}

function generateFullReducer(_: boolean, action: { type: string }) {
  switch (action.type) {
    case "set generate full": {
      return true;
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

// function topicReducer(_: string, action: { type: string; newTopic: string }) {
//   switch (action.type) {
//     case "set topic": {
//       return action.newTopic;
//     }
//     default: {
//       throw new Error(`Unhandled action type: ${action.type}`);
//     }
//   }
// }

export default Landing;
