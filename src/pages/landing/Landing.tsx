import React from "react";
// import SelectionCards from "./SelectionCards";
// import {useState} from 'react';
// import { useEffect } from "react";
// import { ChangeEvent } from "react";
import { FormEvent } from "react";
import { useImmerReducer } from 'use-immer';
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { useNavigate } from 'react-router-dom';
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

const TableOfContents = z.object({
  chapters: z.array(ChapterDetails)
});

export { SectionDetails, ChapterDetails };

const openai = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY, dangerouslyAllowBrowser: true });


function Landing() {
  const [topic, dispatchTopic] = useImmerReducer(topicReducer, '');
  const [loading, dispatchLoad] = useImmerReducer(loadingReducer, false);

  const navigate = useNavigate();


  const handleTopicSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatchLoad({ type: 'set loading', setLoad: true });

    try {
      const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
          { role: "system", content: "You are a course textbook writing expert" },
          { role: "user", content: `Generate the table of contents (include chapter and sections) for a textbook on ${topic}` },
        ],
        response_format: zodResponseFormat(TableOfContents, "table_of_contents"),
      });


      console.log(completion.choices[0].message.parsed);
      // Perform any action with the response here
      navigate('/book', { state: { tableOfContents: completion.choices[0].message.parsed?.chapters } });
    } catch (error) {
      console.error("Error fetching completion: ", error);
    } finally {
      dispatchLoad({ type: 'set loading', setLoad: false });
    }
  }

  return (
    <section className="py-[--section-padding] h-full" data-theme="autumn">
      <div className="flex flex-col w-full max-w-7xl m-auto h-full px-2.5 text-2xl md:text-1xl lg:text-3xl xl:text-4xl">
        <h1 className="text-center">BookGen&#128214;</h1>
        <div className="divider my-1"></div>

        {/* there probably needs to be handler function here for the form submission */}
        <form 
          className="flex flex-col justify-around px-2.5 space-y-4 h-full"
          onSubmit={handleTopicSubmit}
        >
          <label className="hidden">Enter Topic:</label>
          <textarea 
            className="textarea textarea-primary textarea-md font-mono text-neutral font-bold h-full" 
            placeholder="Enter the topic you want to study..." 
            onChange={(e) => dispatchTopic({ type: 'set topic', newTopic: e.target.value,})}
            value={topic}
          />
          <button type="submit" className="btn btn-wide btn-primary self-center">{loading ? <><span className="loading loading-spinner"></span>Generating</> : "Generate Table of Contents"}</button>
        </form>
        {/* <h1>{topic}</h1> */}
      </div>
    </section>
  );
}

function loadingReducer(draft: boolean, action: { type: string; setLoad: boolean; }) {
  switch (action.type) {
    case 'set loading': {
      return action.setLoad;
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function topicReducer(draft: string, action: { type: string; newTopic: string; }) {
  switch (action.type) {
    case 'set topic': {
      return action.newTopic;
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export default Landing;
