import { useChapters } from "../../../ChaptersUtils";

function BookNavigation({
  renderChapter,
  chaptersRef,
  sectionsRef,
  scrollableContainerRef,
}: {
  renderChapter: boolean[];
  chaptersRef: Array<HTMLHeadingElement | null>;
  sectionsRef: Array<Array<HTMLHeadingElement | null>>;
  scrollableContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const chapters = useChapters();

  const scrollToElement = (element: HTMLElement | null) => {
    if (element && scrollableContainerRef.current) {
      const container = scrollableContainerRef.current;
      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const offset = elementRect.top - containerRect.top + container.scrollTop;

      container.scrollTo({
        top: offset,
        behavior: "smooth",
      });
    }
  };

  return (
    <ul className="menu menu-lg flex-nowrap bg-base-200 text-base-content w-80 max-w-full p-4 overflow-y-auto overscroll-none flex-grow">
      {chapters.map(
        (chapter, i) =>
          renderChapter[i] && (
            <li key={i}>
              <details>
                <summary>
                  <a
                    onClick={() => {
                      scrollToElement(chaptersRef[i]);
                    }}
                    className="text-pretty text-inherit hover:text-inherit"
                  >{`Ch. ${chapter.number} ${chapter.title}`}</a>
                </summary>
                <ul>
                  {chapter.sections.map(
                    (section, j) =>
                      section.content.article !== "" && (
                        <li key={j}>
                          <a
                            onClick={() => {
                              scrollToElement(sectionsRef[i][j]);
                            }}
                            className="text-pretty text-inherit hover:text-inherit"
                          >{`${chapter.number}.${section.number} ${section.title}`}</a>
                        </li>
                      )
                  )}
                </ul>
              </details>
            </li>
          )
      )}
    </ul>
  );
}

export default BookNavigation;
