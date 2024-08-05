import React from "react";
import SelectionCards from "./SelectionCards";

function Landing() {
  return (
    <section className="py-[--section-padding] h-full">
      <div className="flex flex-col justify-around font-black  border-green-400 w-full max-w-7xl m-auto h-full">
        <h1 >BookGen&#128214;</h1>
        <div className="divider"></div>
        <form>
          <textarea className="textarea" placeholder="Enter the topic you want to study..."></textarea>
          <button className="btn">Generate Table of Contents</button>
        </form>
      </div>
    </section>
  );
}

export default Landing;
