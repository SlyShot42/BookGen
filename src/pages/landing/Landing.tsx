import React from "react";
// import SelectionCards from "./SelectionCards";
// import {useState} from 'react';
import { useEffect } from "react";
import { ChangeEvent } from "react";
import { useImmerReducer } from 'use-immer';



function Landing() {
  const [topic, dispatch] = useImmerReducer(topicReducer, '');

  // const [topic, setTopic] = useState('');

  useEffect(() => {
    console.log(topic);
  }, [topic]);


  return (
    <section className="py-[--section-padding] h-full" data-theme="autumn">
      <div className="flex flex-col w-full max-w-7xl m-auto h-full px-2.5">
        <h1 className="text-center">BookGen&#128214;</h1>
        <div className="divider"></div>

        {/* there probably needs to be handler function here for the form submission */}
        <form className="flex flex-col justify-around px-2.5 space-y-4">
          <label className="hidden">Enter Topic:</label>
          <textarea 
            className="textarea textarea-primary textarea-md font-mono text-neutral font-bold min-h-52" 
            placeholder="Enter the topic you want to study..." 
            onChange={(e) => dispatch({ type: 'set topic', newTopic: e.target.value,})}
            value={topic}
            cols={50}
            rows={10}
          />
          <button type="submit" className="btn btn-wide btn-primary self-center">Generate Table of Contents</button>
        </form>
        {/* <h1>{topic}</h1> */}
      </div>
    </section>
  );
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
