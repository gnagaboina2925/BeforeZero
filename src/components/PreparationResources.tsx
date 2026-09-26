import { PREPARATION_RESOURCES, RESOURCES_DISCLAIMER } from "@/lib/guidance";

export function PreparationResources({ print = false }: { print?: boolean }) {
  return (
    <div className={print ? undefined : "result-block"}>
      <h2 className={print ? undefined : "section-heading"}>Preparation resources</h2>
      <p className={print ? undefined : "result-body"}>{RESOURCES_DISCLAIMER}</p>
      {print ? (
        <ul>
          {PREPARATION_RESOURCES.map((item) => (
            <li key={item.url}>
              {item.title}: {item.url}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="result-list resource-list">
          {PREPARATION_RESOURCES.map((item) => (
            <li key={item.url}>
              <a className="resource-link" href={item.url} rel="noopener noreferrer" target="_blank">
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
