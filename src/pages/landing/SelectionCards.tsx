import React, { useRef, useState } from 'react'

function SelectionCards() {
  const carouselRef = useRef(null);
  const [isGenerateClicked, setIsGenerateClicked] = useState(false);

  const handleGenerateClick = (e) => {
    e.preventDefault();
    setIsGenerateClicked(true);
    carouselRef.current.scrollBy({
      left: window.innerWidth,
      behavior: 'smooth'
    });
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-grow flex flex-col'>
        <div className='carousel h-full' style={{'overflowX': 'hidden', 'overflowY': 'auto'}} ref={carouselRef}>
          <div className='carousel-item w-full p-1'>
            <div className="flex flex-col items-stretch justify-center gap-y-4 w-full h-full">
              <h1 className="flex-auto text-6xl font-serif font-semibold">BookGen&#128214;</h1>
              <div className="flex-auto divider divider-accent"></div>
              <form className="flex-auto form-control items-stretch justify-center gap-y-4 ">
                <textarea className="textarea h-full" placeholder="Enter the topic you want to study..."></textarea>
                <button className="btn btn-primary" onClick={handleGenerateClick}>Generate Table of Contents<span className="loading loading-dots loading-xs"></span></button>
              </form>
            </div>
          </div>
          <div className='carousel-item w-full'>
            <div>Table of Contents selection</div>
          </div>
        </div>
      </div>
      <ul className="steps mt-2">
        <li className="step step-secondary">Enter Topic</li>
        <li className={isGenerateClicked ? "step step-secondary" : "step"}>Select Content</li>
      </ul>
    </div>
  )
}


export default SelectionCards
