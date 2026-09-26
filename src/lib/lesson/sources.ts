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
  | "ready-disability-transport"
  | "ready-disability-neighbors"
  | "ready-high-rise-elevators"
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
  | "cdc-tornado-unable-to-move"
  | "usfa-escape-plans"
  | "usfa-smoke-alarms"
  | "usfa-fire-disability"
  | "ready-home-fires-speed"
  | "ready-home-fires-alarms"
  | "ready-home-fires-plan"
  | "ready-home-fires-during"
  | "ready-home-fires-after"
  | "ready-home-fire-drill";

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
  "ready-disability-transport": {
    id: "ready-disability-transport",
    title: "Ready.gov People with Disabilities — accessible transportation",
    url: "https://www.ready.gov/disability",
    retrieved: "2026-09-09",
    excerpt:
      "Plan ahead for accessible transportation that you may need for evacuation or getting around during or after disaster. Check with local transit providers as well as with your emergency management agency to identify appropriate accessible options.",
  },
  "ready-disability-neighbors": {
    id: "ready-disability-neighbors",
    title: "Ready.gov People with Disabilities — neighbors who can assist",
    url: "https://www.ready.gov/disability",
    retrieved: "2026-09-09",
    excerpt: "Communicate with neighbors who can assist you if you need to evacuate the building.",
  },
  "ready-high-rise-elevators": {
    id: "ready-high-rise-elevators",
    title: "Ready.gov Plan for Locations — high-rise buildings",
    url: "https://www.ready.gov/plan-for-locations",
    retrieved: "2026-04-29",
    excerpt:
      "Do not use elevators. Know where the closest emergency exit is. Know another way out in case your first choice is blocked. Listen for and follow instructions.",
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
  "usfa-escape-plans": {
    id: "usfa-escape-plans",
    title: "USFA — Home Fire Escape Plans",
    url: "https://www.usfa.fema.gov/prevention/home-fires/prepare-for-fire/home-fire-escape-plans/",
    retrieved: "2026-09-26",
    excerpt:
      "Residents could have less than 2 minutes to escape a home fire once the smoke alarm sounds. Draw a map of your home. Include all doors and windows. Find 2 ways out of every room. Make sure doors and windows are not blocked. Choose an outside meeting place in front of your home. Practice your home fire drill with everyone in the home. Get outside to your meeting place.",
  },
  "usfa-smoke-alarms": {
    id: "usfa-smoke-alarms",
    title: "USFA — Smoke Alarms",
    url: "https://www.usfa.fema.gov/prevention/home-fires/prepare-for-fire/smoke-alarms/",
    retrieved: "2026-09-26",
    excerpt:
      "Put smoke alarms inside and outside each bedroom and sleeping area. Put alarms on every level of the home. Smoke alarms should be interconnected. When one sounds, they all sound. There are also alarms for people with hearing loss. These alarms may have strobe lights that flash and/or vibrate. Test your alarms every month. When you hear a smoke alarm, you may have less than 2 minutes to get everyone outside and safe.",
  },
  "usfa-fire-disability": {
    id: "usfa-fire-disability",
    title: "USFA — Fire Safety for People with Disabilities",
    url: "https://www.usfa.fema.gov/prevention/home-fires/at-risk-audiences/people-with-disabilities/",
    retrieved: "2026-09-26",
    excerpt:
      "Have smoke alarms on every level of your home, inside bedrooms and outside sleeping areas. Interconnect your alarms so that when one sounds, they all sound. If you are deaf or hard of hearing, use smoke alarms with a vibrating pad, flashing light or strobe light. Test your alarms every month. Know 2 ways out of every room. If possible, live near an exit. You’ll be safest on the ground floor if you live in an apartment building. If you live in a multistory home, sleep on the first floor.",
  },
  "ready-home-fires-speed": {
    id: "ready-home-fires-speed",
    title: "Ready.gov Home Fires — Learn About Fires",
    url: "https://www.ready.gov/home-fires",
    retrieved: "2026-09-26",
    excerpt:
      "A fire can become life-threatening in just two minutes. Smoke and toxic gases kill more people than flames do.",
  },
  "ready-home-fires-alarms": {
    id: "ready-home-fires-alarms",
    title: "Ready.gov Home Fires — Smoke Alarms",
    url: "https://www.ready.gov/home-fires",
    retrieved: "2026-09-26",
    excerpt:
      "A working smoke alarm significantly increases your chances of surviving a deadly home fire. Install smoke alarms on every level of your home, including the basement. Audible alarms are available for visually impaired people and smoke alarms with a vibrating pad or flashing light are available for the hearing impaired.",
  },
  "ready-home-fires-plan": {
    id: "ready-home-fires-plan",
    title: "Ready.gov Home Fires — Create and Practice a Fire Escape Plan",
    url: "https://www.ready.gov/home-fires",
    retrieved: "2026-09-26",
    excerpt:
      "Find two ways to get out of each room in the event the primary way is blocked by fire or smoke. Make sure that windows are not stuck, screens can be taken out quickly and that security bars can be properly opened. If you use a walker or wheelchair, check all exits to be sure you can get through the doorways. Practice your home fire escape plan twice each year.",
  },
  "ready-home-fires-during": {
    id: "ready-home-fires-during",
    title: "Ready.gov Home Fires — During a Fire",
    url: "https://www.ready.gov/home-fires",
    retrieved: "2026-09-26",
    excerpt:
      "Drop down to the floor and crawl low, under any smoke to your exit. Before opening a door, feel the doorknob and door. If either is hot, or if there is smoke coming around the door, leave the door closed and use your second way out. If you can’t get to someone needing assistance, leave the home and call 9-1-1 or the fire department. Tell the emergency operator where the person is located. If you can’t get out, close the door and cover vents and cracks around doors with cloth or tape to keep smoke out. Call 9-1-1 or your fire department. Say where you are and signal for help at the window with a light-colored cloth or a flashlight.",
  },
  "ready-home-fires-after": {
    id: "ready-home-fires-after",
    title: "Ready.gov Home Fires — After a Fire",
    url: "https://www.ready.gov/home-fires",
    retrieved: "2026-09-26",
    excerpt: "Check with the fire department to make sure your residence is safe to enter.",
  },
  "ready-home-fire-drill": {
    id: "ready-home-fire-drill",
    title: "Ready.gov — Practice Your Home Fire Escape Plan",
    url: "https://www.ready.gov/home-fire-escape-plan",
    retrieved: "2026-09-26",
    excerpt:
      "Choose a safe meeting place a safe distance from your home. Once they are out, stay out. In a real fire, get to the safe meeting place, then call 9-1-1 and keep everyone close until firefighters arrive.",
  },
};

export const LESSON_SOURCE_LINKS = [
  { title: "Hurricanes (Ready.gov)", url: "https://www.ready.gov/hurricanes" },
  { title: "Floods (Ready.gov)", url: "https://www.ready.gov/floods" },
  { title: "Emergency Alerts (Ready.gov)", url: "https://www.ready.gov/alerts" },
  { title: "People with Disabilities (Ready.gov)", url: "https://www.ready.gov/disability" },
] as const;

export const HOME_FIRE_SOURCE_LINKS = [
  { title: "Home Fire Escape Plans (USFA)", url: "https://www.usfa.fema.gov/prevention/home-fires/prepare-for-fire/home-fire-escape-plans/" },
  { title: "Smoke Alarms (USFA)", url: "https://www.usfa.fema.gov/prevention/home-fires/prepare-for-fire/smoke-alarms/" },
  { title: "Fire Safety for People with Disabilities (USFA)", url: "https://www.usfa.fema.gov/prevention/home-fires/at-risk-audiences/people-with-disabilities/" },
  { title: "Home Fires (Ready.gov)", url: "https://www.ready.gov/home-fires" },
  { title: "Practice Your Home Fire Escape Plan (Ready.gov)", url: "https://www.ready.gov/home-fire-escape-plan" },
  { title: "People with Disabilities (Ready.gov)", url: "https://www.ready.gov/disability" },
] as const;

export const TORNADO_SOURCE_LINKS = [
  { title: "Understand Tornado Alerts (NWS)", url: "https://www.weather.gov/safety/tornado-ww" },
  { title: "What to do During a Tornado (NWS)", url: "https://www.weather.gov/safety/tornado-during" },
  { title: "Stay Safe During a Tornado (CDC)", url: "https://www.cdc.gov/tornadoes/safety/stay-safe-during-a-tornado-safety.html" },
  { title: "Emergency Alerts (Ready.gov)", url: "https://www.ready.gov/alerts" },
  { title: "People with Disabilities (Ready.gov)", url: "https://www.ready.gov/disability" },
] as const;
