export interface CaseStudy {
  id: string;
  title: string;
  when: string;
  where: string;
  summary: string;
  reconstructionNote: string;
  timeline: Array<{ date: string; fact: string; source: string }>;
  lessons: string[];
  sources: Array<{ title: string; url: string }>;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "harvey-2017",
    title: "Hurricane Harvey (2017)",
    when: "August 2017",
    where: "Texas Gulf Coast and southeastern Texas, including the Houston area",
    summary:
      "The National Hurricane Center’s 2017 Harvey advisory archive documents a tropical cyclone that was named in mid-August, approached the Texas coast on 24–25 August 2017, and remained a focus of NHC public advisories through 30 August 2017. After landfall, Harvey produced prolonged heavy rainfall and catastrophic freshwater flooding well inland of the coast. This page does not invent rainfall totals, casualty counts, or personal testimony.",
    reconstructionNote:
      "Any layout or coloring on this page is a website illustration. It is not documentary footage, satellite imagery, or a reconstruction of a specific neighborhood.",
    timeline: [
      {
        date: "17 August 2017",
        fact: "NHC began issuing Harvey forecast and public advisories (Advisory 1, 1500 UTC).",
        source: "https://www.nhc.noaa.gov/archive/2017/HARVEY.shtml",
      },
      {
        date: "24–25 August 2017",
        fact: "NHC public advisories increased in frequency as Harvey approached the Texas coast, including frequent updates on 25 August 2017.",
        source: "https://www.nhc.noaa.gov/archive/2017/HARVEY.shtml",
      },
      {
        date: "26–30 August 2017",
        fact: "NHC continued public advisories while Harvey remained over or near southeastern Texas, a period associated with prolonged inland rainfall and flooding in official after-action reporting.",
        source: "https://www.nhc.noaa.gov/archive/2017/HARVEY.shtml",
      },
      {
        date: "25 August 2017 onward (disaster assistance)",
        fact: "FEMA lists Texas Hurricane Harvey as major disaster DR-4332, with an incident period beginning 23 August 2017.",
        source: "https://www.fema.gov/disaster/4332",
      },
    ],
    lessons: [
      "Ready.gov: hurricanes are not just a coastal problem. Rain, wind, water, and flooding can happen far inland from landfall.",
      "Ready.gov: do not walk, swim, or drive through flood waters. Turn Around. Don’t Drown.",
      "Ready.gov: have several ways to receive alerts, and follow local emergency managers.",
      "These lessons are general official guidance. They are not a finding about what any household in 2017 should have done.",
    ],
    sources: [
      { title: "NHC Harvey 2017 advisory archive", url: "https://www.nhc.noaa.gov/archive/2017/HARVEY.shtml" },
      { title: "NHC Tropical Cyclone Report index (Harvey AL092017)", url: "https://www.nhc.noaa.gov/data/tcr/AL092017_Harvey.pdf" },
      { title: "FEMA Disaster DR-4332 (Texas Hurricane Harvey)", url: "https://www.fema.gov/disaster/4332" },
      { title: "Ready.gov Hurricanes", url: "https://www.ready.gov/hurricanes" },
      { title: "Ready.gov Floods", url: "https://www.ready.gov/floods" },
    ],
  },
  {
    id: "ian-2022",
    title: "Hurricane Ian (2022)",
    when: "23–30 September 2022",
    where: "Southwestern and central Florida, with additional landfall in South Carolina; earlier landfall in western Cuba",
    summary:
      "The National Hurricane Center Tropical Cyclone Report for Hurricane Ian (AL092022, updated 12 March 2026) states that Ian made landfall in southwestern Florida at category 4 intensity, producing catastrophic storm surge, damaging winds, and historic freshwater flooding across much of central and northern Florida. Ian later made landfall as a category 1 hurricane in South Carolina. That NHC report also states Ian was responsible for over 150 direct and indirect deaths and approximately $112 billion in damage (2022 USD). Those figures are quoted from NHC, not estimated here.",
    reconstructionNote:
      "Any layout or coloring on this page is a website illustration. It is not documentary footage, satellite imagery, or a reconstruction of a specific neighborhood.",
    timeline: [
      {
        date: "23 September 2022",
        fact: "NHC: a tropical depression formed about 130 nautical miles east-northeast of Aruba around 0600 UTC 23 September.",
        source: "https://www.nhc.noaa.gov/data/tcr/AL092022_Ian.pdf",
      },
      {
        date: "27 September 2022",
        fact: "NHC: Ian made landfall near La Coloma, Pinar del Río Province, Cuba, at 0830 UTC as a 110-kt category 3 hurricane.",
        source: "https://www.nhc.noaa.gov/data/tcr/AL092022_Ian.pdf",
      },
      {
        date: "28 September 2022",
        fact: "NHC: Ian made landfall on Cayo Costa, Florida, at 1905 UTC at 130 kt, then near Punta Gorda at 2035 UTC at 125 kt.",
        source: "https://www.nhc.noaa.gov/data/tcr/AL092022_Ian.pdf",
      },
      {
        date: "30 September 2022",
        fact: "NHC: Ian made a final landfall near Georgetown, South Carolina, at 1805 UTC at 70 kt.",
        source: "https://www.nhc.noaa.gov/data/tcr/AL092022_Ian.pdf",
      },
    ],
    lessons: [
      "NHC documents both storm surge at the coast and historic freshwater flooding inland. Ready.gov likewise says hurricanes can bring flooding far from landfall.",
      "Ready.gov: if you live in a mandatory evacuation zone and local officials tell you to evacuate, do so immediately. This site cannot map your zone.",
      "Ready.gov: take refuge in a designated storm shelter or an interior room for high winds; if trapped by flooding, go to the highest level and do not use a closed attic.",
      "Ready.gov: after a hurricane, pay attention to local officials; do not touch electrical equipment if it is wet or if you are standing in water.",
    ],
    sources: [
      { title: "NHC Tropical Cyclone Report: Hurricane Ian (AL092022)", url: "https://www.nhc.noaa.gov/data/tcr/AL092022_Ian.pdf" },
      { title: "Ready.gov Hurricanes", url: "https://www.ready.gov/hurricanes" },
      { title: "Ready.gov Floods", url: "https://www.ready.gov/floods" },
    ],
  },
];
