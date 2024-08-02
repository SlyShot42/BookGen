import React from "react";
import SelectionCards from "./SelectionCards";

function Landing() {
  return (
    <div className="flex justify-center items-center h-full">
      <div
        data-theme="autumn"
        className="hero bg-neutral rounded-box flex flex-col min-h-fit"
      >
        <div className="hero-content text-center grow">
          <div className="flex flex-row">
            <SelectionCards />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
