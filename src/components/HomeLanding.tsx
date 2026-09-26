"use client";

import Link from "next/link";
import { PRACTICE_DISCLAIMER, PRODUCT_NAME, TAGLINE } from "@/lib/scenario";

export function HomeLanding() {
  return (
    <section className="animate-in" aria-labelledby="home-heading">
      <p className="kicker">{PRACTICE_DISCLAIMER}</p>
      <h1 id="home-heading" className="display">
        {PRODUCT_NAME}
      </h1>
      <p className="tagline">{TAGLINE}</p>
      <p className="lede">
        An emergency-learning website: study past storms, practice a captioned lesson, and read
        official weather alerts. This is not a notification or dispatch service.
      </p>
      <ul className="home-pillars">
        <li>
          <h2 className="section-heading">Learn</h2>
          <p className="result-body">Two sourced U.S. hurricane case studies from NHC and FEMA records.</p>
          <Link className="btn-primary" href="/learn">
            Open case studies
          </Link>
        </li>
        <li>
          <h2 className="section-heading">Practice</h2>
          <p className="result-body">Captioned hurricane, tornado, and home-fire lessons that teach, then optionally practice decisions.</p>
          <Link className="btn-primary" href="/practice">
            Start practice
          </Link>
        </li>
        <li>
          <h2 className="section-heading">Alerts</h2>
          <p className="result-body">On-demand National Weather Service alerts for a place you confirm.</p>
          <Link className="btn-primary" href="/alerts">
            Check alerts
          </Link>
        </li>
      </ul>
      <p className="result-note">
        Secondary:{" "}
        <Link className="resource-link" href="/simulate">
          blackout simulation
        </Link>{" "}
        and{" "}
        <Link className="resource-link" href="/practice/rehearsal">
          five-step household rehearsal
        </Link>
        .
      </p>
    </section>
  );
}
