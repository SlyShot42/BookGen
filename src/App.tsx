import "./App.css";
import { Route, Routes } from "react-router-dom";
import Landing from "./pages/landing/Landing";
import BookContentSelector from "./pages/content selection/ContentSelection";
import Content from "./pages/content/Content";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/book" element={<BookContentSelector />} />
      <Route path="/content" element={<Content />} />
    </Routes>
  );
}

export default App;
