# BookGen

BookGen is a Vite + React TypeScript application that generates textbook style content using the OpenAI API. Users can create a table of contents for a chosen topic, selectively generate chapters/sections, and read the results in a built-in viewer with navigation and AI chat assistant.

## Features

- **OpenAI content generation** – produces chapter sections and example problems.
- **Interactive multiple choice problems** – users choose answers and receive grading feedback.
- **Selective generation** – pick which sections to generate before starting.
- **Sidebar navigation and chat** – navigate the book and ask questions via the integrated chat assistant.
- **React Query** – asynchronous data fetching and caching with devtools.
- **Tailwind CSS and DaisyUI** – modern responsive styling.

## Requirements

- Node.js (v18 or later recommended)
- An OpenAI API key

## Installation

```bash
npm install
```

Create a `.env` file at the project root and add your API key:

```env
VITE_OPENAI_API_KEY=your-openai-key
```

## Usage

- **Development**

  ```bash
  npm run dev
  ```

- **Linting**

  ```bash
  npm run lint
  ```

- **Production build**

  ```bash
  npm run build
  npm run preview # preview the build
  ```

Scripts are defined in `package.json`.

## Project Structure

```
src/
  App.tsx                # Application routes
  components/            # Book generator, Markdown renderer, problem components
  pages/                 # Landing, content selection, content reader
  ChaptersContext.tsx    # Stores chapters in sessionStorage
  TopicContext.tsx       # Stores current topic
```

Chapters and topic selections persist across page reloads using session storage. Multiple choice problems now allow answer selection and grading directly in the reader.

## License

Specify the license information here if applicable.

