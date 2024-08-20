import React from 'react';
import OpenAI from 'openai';
import { useImmerReducer } from 'use-immer';
import { ChapterDetails } from '../pages/landing/Landing';
import { z } from 'zod';

const openai = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY, dangerouslyAllowBrowser: true });

type ChapterDetailsType = z.infer<typeof ChapterDetails>;

function BookGenerator({chapters, sectionSelections = null}: {chapters: ChapterDetailsType[] | null, sectionSelections?: boolean[][] | null}) {
  let fullSelection: boolean[][] = [];
  

  if (chapters) {
    fullSelection = chapters.map((chapter) => Array(chapter.sections.length).fill(true));

  }
  

  const maxProgress = sectionSelections ? sectionSelections.flat().reduce((accumulator, currentValue) => accumulator + (currentValue ? 1 : 0), 0) : fullSelection.flat().length;
  const [currentProgress, dispatchProgress] = useImmerReducer(progressReducer, 0);

  const generateContent = async (title: string) => {
    try {
      const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
          { role: "system", content: "You are a course textbook writing expert" },
          { role: "user", content: `Generate the content for a textbook on ${title}` },
        ],
        response_format: OpenAI.zodResponseFormat(OpenAI.Content, "content"),
      });
      console.log(completion.choices[0].message.parsed);
    } catch(error) {
      console.error("Error fetching completion", error);
    } finally {
      dispatchProgress({ type: 'increment' });
    }
  }

  return (
    <>
        <h1>Generating Book</h1>
        <progress 
          className="progress progress-primary w-full" 
          value={currentProgress}
          max={maxProgress}
        />
        
    </>
  )
}

export default BookGenerator