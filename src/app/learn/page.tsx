import { CASE_STUDIES } from "@/lib/learn/cases";

export default function LearnPage() {
  return (
    <main id="main-content" className="app-main" tabIndex={-1}>
      <div className="panel">
        <p className="kicker">Learn from past events</p>
        <h1 className="display-sm">Two official storm case studies</h1>
        <p className="lede">
          These summaries use National Hurricane Center and FEMA records, plus Ready.gov guidance.
          They are not documentaries, and they do not assign blame to survivors.
        </p>
        {CASE_STUDIES.map((study) => (
          <article key={study.id} className="case-study">
            <h2>{study.title}</h2>
            <p className="result-body">
              <strong>When: </strong>
              {study.when}
            </p>
            <p className="result-body">
              <strong>Where: </strong>
              {study.where}
            </p>
            <p className="result-body">{study.summary}</p>
            <p className="result-note">{study.reconstructionNote}</p>
            <h3 className="section-heading">Timeline (sourced)</h3>
            <ol>
              {study.timeline.map((item) => (
                <li key={item.date + item.fact}>
                  <p className="result-title">{item.date}</p>
                  <p className="result-body">{item.fact}</p>
                  <p>
                    <a className="resource-link" href={item.source} rel="noopener noreferrer" target="_blank">
                      Source
                    </a>
                  </p>
                </li>
              ))}
            </ol>
            <h3 className="section-heading">Preparedness lessons from official guidance</h3>
            <ul>
              {study.lessons.map((lesson) => (
                <li key={lesson} className="result-body">
                  {lesson}
                </li>
              ))}
            </ul>
            <h3 className="section-heading">Sources</h3>
            <ul className="resource-list">
              {study.sources.map((source) => (
                <li key={source.url}>
                  <a className="resource-link" href={source.url} rel="noopener noreferrer" target="_blank">
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </main>
  );
}
