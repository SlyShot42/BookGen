import OpenAI from 'openai';
import { useImmerReducer } from 'use-immer';
import { ChapterDetails } from '../pages/landing/Landing';
import { useEffect } from 'react';
import { useRef } from 'react';
import { z } from 'zod';

const openai = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY, dangerouslyAllowBrowser: true });

type ChapterDetailsType = z.infer<typeof ChapterDetails>;

function BookGenerator({chapters, topic, sectionSelections = null}: {chapters: ChapterDetailsType[] | null, topic: string, sectionSelections?: boolean[][] | null}) {
  
  
  const totalSections = chapters!.reduce((accumulator, currentValue) => accumulator + currentValue.sections.length, 0);
  
  
  // compute max progress by totalling the trues in sectionSelections or using totalSections
  const maxProgress = sectionSelections ? sectionSelections.flat().reduce((accumulator, currentValue) => accumulator + Number(currentValue), 0) : totalSections;

  const [currentProgress, dispatchProgress] = useImmerReducer(progressReducer, 0);

  const sectionContent = useRef(chapters!.map((chapter: ChapterDetailsType) => Array(chapter.sections.length).fill('')));
  const currentIndex = useRef([0, 0]);
  
  useEffect(() => {
      const generateContent = async (title: string) => {
        let content: string | null = "";
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-2024-08-06",
            messages: [
              {
                  "role": "system",
                  "content": "You are a course textbook content generation machine designed to output in markdown(surround inline latex with $..$ and display latex with $$..$$). Do not acknowledge or greet. Output the content only. Expand on information where appropriate.",
              },
              {
                  "role": "user",
                  "content": "Generate the content of the section (do not include section title in reponse): \n"
                  + title
                  + "\n in the\n"
                  + topic
                  + "\n textbook.",
              },
            ],
            temperature: 0.4
          });
          console.log(completion.choices[0].message.content)
          content = completion.choices[0].message.content;
        } catch(error) {
          console.error("Error fetching completion", error);
        } finally {
          dispatchProgress({ type: 'increment' });
        }
        return content;
      }
      
    if (currentProgress < maxProgress) {
      if (sectionSelections) {
        const [chapterIndex, sectionIndex] = currentIndex.current;
        if (sectionSelections[chapterIndex][sectionIndex]) {
          sectionContent.current[chapterIndex][sectionIndex] = generateContent(chapters![chapterIndex].sections[sectionIndex].title);
          
        }

        if (sectionIndex < sectionSelections[chapterIndex].length - 1) {
          currentIndex.current = [chapterIndex, sectionIndex + 1];
        } else if (chapterIndex < sectionSelections.length - 1) {
          currentIndex.current = [chapterIndex + 1, 0];
        }
      } else {
        const [chapterIndex, sectionIndex] = currentIndex.current;
        sectionContent.current[chapterIndex][sectionIndex] = generateContent(chapters![chapterIndex].sections[sectionIndex].title);

        if (sectionIndex < chapters![chapterIndex].sections.length - 1) {
          currentIndex.current = [chapterIndex, sectionIndex + 1];
        } else if (chapterIndex < chapters!.length - 1) {
          currentIndex.current = [chapterIndex + 1, 0];
        }
      }
    }
  }, [chapters, currentProgress, dispatchProgress, maxProgress, sectionSelections, topic])


  return (
    <>
        <h1>Generating Book</h1>
        <progress 
          className="progress progress-primary w-full" 
          value={currentProgress}
          max={maxProgress}
        />
        <p>{currentProgress}/{maxProgress}</p>
    </>
  )
}

const progressReducer = (draft: number, action: { type: string }) => {
  switch (action.type) {
    case 'increment':
      return draft + 1;
    default:
      return;
  }
}

export default BookGenerator