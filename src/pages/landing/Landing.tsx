import React from "react";
// import SelectionCards from "./SelectionCards";
// import {useState} from 'react';
// import { useEffect } from "react";
// import { ChangeEvent } from "react";
import { useRef } from "react";
import { useImmerReducer } from "use-immer";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { useNavigate } from "react-router-dom";
import BookGenerator from "../../components/BookGenerator";
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

type ChapterDetailsType = z.infer<typeof ChapterDetails>;
type sectionDetailsType = z.infer<typeof SectionDetails>;

const TableOfContents = z.object({
  chapters: z.array(ChapterDetails),
});

export { SectionDetails, ChapterDetails };

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function Landing() {
  const [topic, dispatchTopic] = useImmerReducer(topicReducer, "");
  const [loading, dispatchLoad] = useImmerReducer(loadingReducer, false);
  const [generateFull, dispatchGenerateFull] = useImmerReducer(
    generateFullReducer,
    false
  );
  const chapters = useRef<ChapterDetailsType[] | null>(null);

  const navigate = useNavigate();

  const handleTopicSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatchLoad({ type: "set loading", setLoad: true });

    try {
      const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
          {
            role: "system",
            content: "You are a course textbook writing expert",
          },
          {
            role: "user",
            content: `Generate the table of contents (include chapter and sections) for a textbook on ${topic}`,
          },
        ],
        response_format: zodResponseFormat(
          TableOfContents,
          "table_of_contents"
        ),
      });

      // console.log(completion.choices[0].message.parsed);
      // Perform any action with the response here
      // navigate('/book', { state: { tableOfContents: completion.choices[0].message.parsed?.chapters } });
      // console.log(typeof completion.choices[0].message.parsed?.chapters);
      chapters.current = completion.choices[0].message.parsed?.chapters || null;

      chapters.current = chapters.current!.map(
        (chapter: ChapterDetailsType, index: number) => {
          return {
            ...chapter,
            number: index + 1,
            sections: chapter.sections.map(
              (section: sectionDetailsType, i: number) => {
                return {
                  ...section,
                  number: i + 1,
                };
              }
            ),
          };
        }
      );
      console.log(chapters.current);
      (document.getElementById("my_modal") as HTMLDialogElement)?.showModal();
    } catch (error) {
      console.error("Error fetching completion: ", error);
    } finally {
      dispatchLoad({ type: "set loading", setLoad: false });
    }
  };

  const handleFullGenerate = () => {
    dispatchGenerateFull({ type: "set generate full" });
  };

  const handleContentSelection = () => {
    navigate("/book", {
      state: { tableOfContents: chapters.current, topic: topic },
    });
  };

  return (
    <section className="py-[--section-padding] h-full" data-theme="autumn">
      <div className="flex flex-col w-full max-w-7xl m-auto h-full px-2.5">
        <h1 className="text-center text-5xl lg:text-6xl xl:text-7xl">
          BookGen&#128214;
        </h1>
        <div className="divider my-1"></div>

        {/* there probably needs to be handler function here for the form submission */}
        <form
          className="flex flex-col px-2.5 space-y-4 h-full"
          onSubmit={handleTopicSubmit}
        >
          <label className="hidden">Enter Topic:</label>
          <textarea
            className="textarea textarea-primary textarea-md font-mono text-neutral font-bold h-full md:max-h-80 lg:max-h-52"
            placeholder="Enter the topic you want to study..."
            onChange={(e) =>
              dispatchTopic({ type: "set topic", newTopic: e.target.value })
            }
            value={topic}
          />
          <button
            type="submit"
            className="btn btn-wide btn-primary self-center"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner"></span>Generating
              </>
            ) : (
              "Generate Table of Contents"
            )}
          </button>
        </form>
        {/* <h1>{topic}</h1> */}
      </div>
      <dialog
        id="my_modal"
        className="modal modal-bottom sm:modal-middle"
        onCancel={(e) => e.preventDefault()}
      >
        <div className="modal-box">
          {generateFull ? (
            <BookGenerator chapters={chapters.current} topic={topic} />
          ) : (
            <>
              <h3 className="font-bold text-lg">
                How much of your book do you want to generate?
              </h3>
              <p className="py-4">
                *Note: Generating a full book can take long depending on the
                number of sections in your book.
              </p>
              <div className="modal-action">
                <form
                  method="dialog"
                  className="flex flex-col justify-around space-y-2 w-full md:flex-row md:space-y-0"
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

function loadingReducer(
  _: boolean,
  action: { type: string; setLoad: boolean }
) {
  switch (action.type) {
    case "set loading": {
      return action.setLoad;
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function topicReducer(_: string, action: { type: string; newTopic: string }) {
  switch (action.type) {
    case "set topic": {
      return action.newTopic;
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export default Landing;
