export type LessonSourceId =
  | "ready-hurricanes-inland"
  | "ready-hurricanes-plan"
  | "ready-hurricanes-plan-disability"
  | "ready-hurricanes-evac-zone"
  | "ready-hurricanes-alerts"
  | "ready-hurricanes-during-informed"
  | "ready-hurricanes-during-evac"
  | "ready-hurricanes-during-wind"
  | "ready-hurricanes-during-flood-level"
  | "ready-hurricanes-during-tadd"
  | "ready-floods-warning"
  | "ready-floods-during-evac"
  | "ready-floods-during-highest"
  | "ready-floods-during-tadd"
  | "ready-alerts-wea"
  | "ready-alerts-eas"
  | "ready-alerts-nwr"
  | "ready-disability-network"
  | "ready-disability-registry";

export interface LessonSource {
  id: LessonSourceId;
  title: string;
  url: string;
  retrieved: string;
  excerpt: string;
}

export const LESSON_SOURCES: Record<LessonSourceId, LessonSource> = {
  "ready-hurricanes-inland": {
    id: "ready-hurricanes-inland",
    title: "Ready.gov Hurricanes — Know Your Hurricane Risk",
    url: "https://www.ready.gov/hurricanes",
    retrieved: "2026-09-24",
    excerpt:
      "Hurricanes are not just a coastal problem. Find out how rain, wind, water and even tornadoes could happen far inland from where a hurricane or tropical storm makes landfall.",
  },
  "ready-hurricanes-plan": {
    id: "ready-hurricanes-plan",
    title: "Ready.gov Hurricanes — Make an Emergency Plan",
    url: "https://www.ready.gov/hurricanes",
    retrieved: "2026-09-24",
    excerpt: "Make sure everyone in your household knows and understands your hurricane plans.",
  },
  "ready-hurricanes-plan-disability": {
    id: "ready-hurricanes-plan-disability",
    title: "Ready.gov Hurricanes — additional help",
    url: "https://www.ready.gov/hurricanes",
    retrieved: "2026-09-24",
    excerpt:
      "Identify whether you may need additional help during an emergency if you or anyone else in your household is an individual with a disability.",
  },
  "ready-hurricanes-evac-zone": {
    id: "ready-hurricanes-evac-zone",
    title: "Ready.gov Hurricanes — Know your Evacuation Zone",
    url: "https://www.ready.gov/hurricanes",
    retrieved: "2026-09-24",
    excerpt:
      "Follow the instructions from local emergency managers, who work closely with state, local, tribal and territorial agencies and partners.",
  },
  "ready-hurricanes-alerts": {
    id: "ready-hurricanes-alerts",
    title: "Ready.gov Hurricanes — Recognize Warnings and Alerts",
    url: "https://www.ready.gov/hurricanes",
    retrieved: "2026-09-24",
    excerpt:
      "Be sure to have several ways to receive alerts. Sign up for community alerts in your area and be aware of the Emergency Alert System (EAS) and Wireless Emergency Alert (WEA), which require no sign up.",
  },
  "ready-hurricanes-during-informed": {
    id: "ready-hurricanes-during-informed",
    title: "Ready.gov Hurricanes — Stay Informed",
    url: "https://www.ready.gov/hurricanes",
    retrieved: "2026-09-24",
    excerpt: "Pay attention to emergency information and alerts.",
  },
  "ready-hurricanes-during-evac": {
    id: "ready-hurricanes-during-evac",
    title: "Ready.gov Hurricanes — mandatory evacuation",
    url: "https://www.ready.gov/hurricanes",
    retrieved: "2026-09-24",
    excerpt:
      "If you live in a mandatory evacuation zone and local officials tell you to evacuate, do so immediately.",
  },
  "ready-hurricanes-during-wind": {
    id: "ready-hurricanes-during-wind",
    title: "Ready.gov Hurricanes — high winds",
    url: "https://www.ready.gov/hurricanes",
    retrieved: "2026-09-24",
    excerpt: "Take refuge in a designated storm shelter or an interior room for high winds.",
  },
  "ready-hurricanes-during-flood-level": {
    id: "ready-hurricanes-during-flood-level",
    title: "Ready.gov Hurricanes — trapped by flooding",
    url: "https://www.ready.gov/hurricanes",
    retrieved: "2026-09-24",
    excerpt:
      "Go to the highest level of the building if you are trapped by flooding. Do not climb into a closed attic. You may become trapped by rising flood water.",
  },
  "ready-hurricanes-during-tadd": {
    id: "ready-hurricanes-during-tadd",
    title: "Ready.gov Hurricanes — flood waters",
    url: "https://www.ready.gov/hurricanes",
    retrieved: "2026-09-24",
    excerpt:
      "Do not walk, swim or drive through flood waters. Turn Around. Don’t Drown! Just six inches of fast-moving water can knock you down, and one foot of moving water can sweep your vehicle away.",
  },
  "ready-floods-warning": {
    id: "ready-floods-warning",
    title: "Ready.gov Floods — under a flood warning",
    url: "https://www.ready.gov/floods",
    retrieved: "2026-09-26",
    excerpt: "Find safe shelter right away. Do not walk, swim or drive through flood waters. Turn Around, Don’t Drown!",
  },
  "ready-floods-during-evac": {
    id: "ready-floods-during-evac",
    title: "Ready.gov Floods — evacuate if told",
    url: "https://www.ready.gov/floods",
    retrieved: "2026-09-26",
    excerpt: "Evacuate immediately, if told to do so. Never drive around barricades.",
  },
  "ready-floods-during-highest": {
    id: "ready-floods-during-highest",
    title: "Ready.gov Floods — highest level",
    url: "https://www.ready.gov/floods",
    retrieved: "2026-09-26",
    excerpt:
      "Get to the highest level if trapped in a building. Only get on the roof if necessary and once there, signal for help. Do not climb into a closed attic to avoid getting trapped by rising floodwater.",
  },
  "ready-floods-during-tadd": {
    id: "ready-floods-during-tadd",
    title: "Ready.gov Floods — during a flood",
    url: "https://www.ready.gov/floods",
    retrieved: "2026-09-26",
    excerpt: "Do not walk, swim or drive through flood waters. Turn Around. Don’t Drown!",
  },
  "ready-alerts-wea": {
    id: "ready-alerts-wea",
    title: "Ready.gov Emergency Alerts — Wireless Emergency Alerts",
    url: "https://www.ready.gov/alerts",
    retrieved: "2026-05-27",
    excerpt:
      "Wireless Emergency Alerts (WEAs) are short emergency alerts authorities can send to any WEA-enabled mobile device in a locally targeted area.",
  },
  "ready-alerts-eas": {
    id: "ready-alerts-eas",
    title: "Ready.gov Emergency Alerts — Emergency Alert System",
    url: "https://www.ready.gov/alerts",
    retrieved: "2026-05-27",
    excerpt:
      "The Emergency Alert System (EAS) is a national public warning system that allows authorized alerting authorities to deliver important emergency information.",
  },
  "ready-alerts-nwr": {
    id: "ready-alerts-nwr",
    title: "Ready.gov Emergency Alerts — NOAA Weather Radio",
    url: "https://www.ready.gov/alerts",
    retrieved: "2026-05-27",
    excerpt:
      "NOAA Weather Radio All Hazards broadcasts official warnings, watches, forecasts and other hazard information 24 hours a day, seven days a week.",
  },
  "ready-disability-network": {
    id: "ready-disability-network",
    title: "Ready.gov People with Disabilities — support network",
    url: "https://www.ready.gov/disability",
    retrieved: "2026-09-09",
    excerpt: "Create a support network of people who can help you in a disaster.",
  },
  "ready-disability-registry": {
    id: "ready-disability-registry",
    title: "Ready.gov People with Disabilities — local registries",
    url: "https://www.ready.gov/disability",
    retrieved: "2026-09-09",
    excerpt:
      "Many city and county emergency management agencies maintain voluntary registries for people with disabilities to self-identify in order to receive targeted assistance during emergencies and disasters. Contact your local emergency management office to find out more.",
  },
};

export const LESSON_SOURCE_LINKS = [
  { title: "Hurricanes (Ready.gov)", url: "https://www.ready.gov/hurricanes" },
  { title: "Floods (Ready.gov)", url: "https://www.ready.gov/floods" },
  { title: "Emergency Alerts (Ready.gov)", url: "https://www.ready.gov/alerts" },
  { title: "People with Disabilities (Ready.gov)", url: "https://www.ready.gov/disability" },
] as const;
