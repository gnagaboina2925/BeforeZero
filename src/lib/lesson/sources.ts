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
  | "ready-disability-registry"
  | "nws-tornado-watch"
  | "nws-tornado-warning"
  | "nws-tornado-during-ready"
  | "nws-tornado-during-house"
  | "nws-tornado-during-outside"
  | "nws-tornado-during-vehicle"
  | "cdc-tornado-warning"
  | "cdc-tornado-signs"
  | "cdc-tornado-tuned"
  | "cdc-tornado-home-basement"
  | "cdc-tornado-home-no-basement"
  | "cdc-tornado-windows"
  | "cdc-tornado-cover"
  | "cdc-tornado-mobile-home"
  | "cdc-tornado-vehicle"
  | "cdc-tornado-outside"
  | "cdc-tornado-wheelchair"
  | "cdc-tornado-unable-to-move";

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
  "nws-tornado-watch": {
    id: "nws-tornado-watch",
    title: "NWS — Tornado Watch",
    url: "https://www.weather.gov/safety/tornado-ww",
    retrieved: "2026-09-26",
    excerpt:
      "Tornado Watch: Be Prepared! Tornadoes are possible in and near the watch area. Review and discuss your emergency plans, take inventory of your supplies and check your safe room. Be ready to act quickly if a warning is issued or you suspect a tornado is approaching.",
  },
  "nws-tornado-warning": {
    id: "nws-tornado-warning",
    title: "NWS — Tornado Warning",
    url: "https://www.weather.gov/safety/tornado-ww",
    retrieved: "2026-09-26",
    excerpt:
      "Tornado Warning: Take Action! A tornado has been sighted or indicated by weather radar. There is imminent danger to life and property. Move to an interior room on the lowest floor of a sturdy building. Avoid windows. If in a mobile home, a vehicle, or outdoors, move to the closest substantial shelter and protect yourself from flying debris.",
  },
  "nws-tornado-during-ready": {
    id: "nws-tornado-during-ready",
    title: "NWS — Stay Weather-Ready",
    url: "https://www.weather.gov/safety/tornado-during",
    retrieved: "2026-09-26",
    excerpt:
      "Continue to listen to local news or a NOAA Weather Radio to stay updated about tornado watches and warnings.",
  },
  "nws-tornado-during-house": {
    id: "nws-tornado-during-house",
    title: "NWS — At Your House",
    url: "https://www.weather.gov/safety/tornado-during",
    retrieved: "2026-09-26",
    excerpt:
      "If you are in a tornado warning, go to your basement, safe room, or an interior room away from windows. Don't forget pets if time allows.",
  },
  "nws-tornado-during-outside": {
    id: "nws-tornado-during-outside",
    title: "NWS — Outside",
    url: "https://www.weather.gov/safety/tornado-during",
    retrieved: "2026-09-26",
    excerpt:
      "Seek shelter inside a sturdy building immediately if a tornado is approaching. Sheds and storage facilities are not safe. Neither is a mobile home or tent.",
  },
  "nws-tornado-during-vehicle": {
    id: "nws-tornado-during-vehicle",
    title: "NWS — In a vehicle",
    url: "https://www.weather.gov/safety/tornado-during",
    retrieved: "2026-09-26",
    excerpt:
      "Being in a vehicle during a tornado is not safe. The best course of action is to drive to the closest shelter. If you are unable to make it to a safe shelter, either get down in your car and cover your head, or abandon your car and seek shelter in a low lying area such as a ditch or ravine.",
  },
  "cdc-tornado-warning": {
    id: "cdc-tornado-warning",
    title: "CDC — Take shelter immediately during a tornado warning",
    url: "https://www.cdc.gov/tornadoes/safety/stay-safe-during-a-tornado-safety.html",
    retrieved: "2026-09-26",
    excerpt: "A tornado warning is issued when a tornado is sighted or indicated by weather radar.",
  },
  "cdc-tornado-signs": {
    id: "cdc-tornado-signs",
    title: "CDC — Take shelter if you see signs of a tornado",
    url: "https://www.cdc.gov/tornadoes/safety/stay-safe-during-a-tornado-safety.html",
    retrieved: "2026-09-26",
    excerpt:
      "Sometimes tornadoes strike quickly, without time for a tornado warning. Signs that a tornado may be approaching include: rotating funnel-shaped cloud; approaching cloud of debris; dark or green-colored sky; large, dark, low-lying cloud; large hail; loud roar that sounds like a freight train.",
  },
  "cdc-tornado-tuned": {
    id: "cdc-tornado-tuned",
    title: "CDC — Stay tuned",
    url: "https://www.cdc.gov/tornadoes/safety/stay-safe-during-a-tornado-safety.html",
    retrieved: "2026-09-26",
    excerpt: "Keep tuned to local radio and TV stations, a NOAA weather radio, or your mobile phone.",
  },
  "cdc-tornado-home-basement": {
    id: "cdc-tornado-home-basement",
    title: "CDC — If you’re at home",
    url: "https://www.cdc.gov/tornadoes/safety/stay-safe-during-a-tornado-safety.html",
    retrieved: "2026-09-26",
    excerpt:
      "If you’re at home, go to your basement or an inside room, without windows, on the lowest floor. The safest place in the home is the interior part of a basement.",
  },
  "cdc-tornado-home-no-basement": {
    id: "cdc-tornado-home-no-basement",
    title: "CDC — If you don't have a basement",
    url: "https://www.cdc.gov/tornadoes/safety/stay-safe-during-a-tornado-safety.html",
    retrieved: "2026-09-26",
    excerpt:
      "If you don't have a basement, go to an inside room, without windows, on the lowest floor. This could be a center hallway, bathroom, or closet. Avoid taking shelter where there are heavy objects on the floor directly above you.",
  },
  "cdc-tornado-windows": {
    id: "cdc-tornado-windows",
    title: "CDC — Stay away from windows",
    url: "https://www.cdc.gov/tornadoes/safety/stay-safe-during-a-tornado-safety.html",
    retrieved: "2026-09-26",
    excerpt:
      "Pick a place in the home where family members can gather if a tornado is headed your way. One basic rule is AVOID WINDOWS. An exploding window can injure or kill.",
  },
  "cdc-tornado-cover": {
    id: "cdc-tornado-cover",
    title: "CDC — added protection under something sturdy",
    url: "https://www.cdc.gov/tornadoes/safety/stay-safe-during-a-tornado-safety.html",
    retrieved: "2026-09-26",
    excerpt:
      "For added protection, get under something sturdy such as a heavy table or workbench. If possible, cover your body with a blanket, sleeping bag, or mattress, and protect your head with anything available—even your hands.",
  },
  "cdc-tornado-mobile-home": {
    id: "cdc-tornado-mobile-home",
    title: "CDC — If you live in a mobile home",
    url: "https://www.cdc.gov/tornadoes/safety/stay-safe-during-a-tornado-safety.html",
    retrieved: "2026-09-26",
    excerpt:
      "Don't stay in a mobile home during a tornado. Mobile homes can turn over during strong winds. Even mobile homes with a tie-down system cannot withstand the force of tornado winds. If you live in a mobile home, go to a nearby building, preferably one with a basement.",
  },
  "cdc-tornado-vehicle": {
    id: "cdc-tornado-vehicle",
    title: "CDC — If you're in a vehicle",
    url: "https://www.cdc.gov/tornadoes/safety/stay-safe-during-a-tornado-safety.html",
    retrieved: "2026-09-26",
    excerpt:
      "Don't try to outrun a tornado. Drive to the closest shelter. If you're unable to make it to a safe shelter, either get down in your vehicle and cover your head and neck or leave your vehicle and seek shelter in a low-lying area such as a ditch or ravine. Stay away from highway overpasses and bridges.",
  },
  "cdc-tornado-outside": {
    id: "cdc-tornado-outside",
    title: "CDC — If you're outside",
    url: "https://www.cdc.gov/tornadoes/safety/stay-safe-during-a-tornado-safety.html",
    retrieved: "2026-09-26",
    excerpt:
      "If there is no shelter nearby, go to a low-lying area such as a ditch or ravine and lie flat. Protect your head and neck with an object or with your arms. Avoid areas with many trees.",
  },
  "cdc-tornado-wheelchair": {
    id: "cdc-tornado-wheelchair",
    title: "CDC — If you are in a wheelchair",
    url: "https://www.cdc.gov/tornadoes/safety/stay-safe-during-a-tornado-safety.html",
    retrieved: "2026-09-26",
    excerpt:
      "If you are in a wheelchair, get away from windows and go to an interior room of the house. If possible, seek shelter under a sturdy table or desk. Cover your head with anything available, even your hands.",
  },
  "cdc-tornado-unable-to-move": {
    id: "cdc-tornado-unable-to-move",
    title: "CDC — If you're unable to move from a bed or a chair",
    url: "https://www.cdc.gov/tornadoes/safety/stay-safe-during-a-tornado-safety.html",
    retrieved: "2026-09-26",
    excerpt:
      "If you're unable to move from a bed or a chair and assistance is not available, protect yourself from falling objects by covering up with blankets and pillows.",
  },
};

export const LESSON_SOURCE_LINKS = [
  { title: "Hurricanes (Ready.gov)", url: "https://www.ready.gov/hurricanes" },
  { title: "Floods (Ready.gov)", url: "https://www.ready.gov/floods" },
  { title: "Emergency Alerts (Ready.gov)", url: "https://www.ready.gov/alerts" },
  { title: "People with Disabilities (Ready.gov)", url: "https://www.ready.gov/disability" },
] as const;

export const TORNADO_SOURCE_LINKS = [
  { title: "Understand Tornado Alerts (NWS)", url: "https://www.weather.gov/safety/tornado-ww" },
  { title: "What to do During a Tornado (NWS)", url: "https://www.weather.gov/safety/tornado-during" },
  { title: "Stay Safe During a Tornado (CDC)", url: "https://www.cdc.gov/tornadoes/safety/stay-safe-during-a-tornado-safety.html" },
  { title: "Emergency Alerts (Ready.gov)", url: "https://www.ready.gov/alerts" },
  { title: "People with Disabilities (Ready.gov)", url: "https://www.ready.gov/disability" },
] as const;
