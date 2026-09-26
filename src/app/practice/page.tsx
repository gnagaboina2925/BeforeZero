import Link from "next/link";
import { LESSON_LIST } from "@/lib/lesson/lessons";

export default function PracticeIndexPage() {
  return (
    <main id="main-content" className="app-main" tabIndex={-1}>
      <section className="practice-landing" aria-labelledby="practice-lessons-heading">
        <p className="kicker">Practice</p>
        <h1 id="practice-lessons-heading" className="practice-heading">
          Choose a lesson
        </h1>
        <p className="practice-lede">
          Each lesson teaches first, then optionally practices decisions. This is not a live warning service.
        </p>
        <ul className="lesson-select">
          {LESSON_LIST.map((lesson) => (
            <li key={lesson.id}>
              <article className="lesson-select-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lesson.previewStill} alt="" />
                <div>
                  <h2 className="lesson-select-title">{lesson.title}</h2>
                  <p className="result-body">{lesson.cardSummary}</p>
                  <p className="result-note">{lesson.previewNote}</p>
                  <Link className="btn-primary" href={`/practice/${lesson.slug}`}>
                    Open {lesson.slug} lesson
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
