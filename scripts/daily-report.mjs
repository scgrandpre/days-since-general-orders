// Daily Drought Report Generator
// Runs in CI every day to recompute a number that anyone could compute
// in their head, then commits the result with full ceremony.

import { readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";

const MS_PER_DAY = 86400000;

const lastPlayedStr = readFileSync("last_played.txt", "utf8").trim();
const [y, m, d] = lastPlayedStr.split("-").map(Number);
const lastPlayed = Date.UTC(y, m - 1, d);

const now = new Date();
const todayStr = now.toISOString().slice(0, 10);
const todayMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
const days = Math.max(0, Math.round((todayMidnight - lastPlayed) / MS_PER_DAY));

function defcon(days) {
  if (days >= 60) return { level: 1, label: "TOTAL STRATEGIC COLLAPSE" };
  if (days >= 30) return { level: 2, label: "CRITICAL GAMING DEFICIT" };
  if (days >= 15) return { level: 3, label: "HIGH ALERT: ORDERS OVERDUE" };
  if (days >= 8) return { level: 4, label: "READINESS: ELEVATED" };
  return { level: 5, label: "READINESS: GREEN" };
}

const MEMOS = [
  "STILL NO ORDERS FROM THE GENERALS. MORALE HOLDS.",
  "THE BOARD REMAINS FOLDED. THE PIECES REMAIN BAGGED. WE REMAIN PATIENT.",
  "SCOUTS REPORT SCOTT SAID 'WE SHOULD PLAY SOON.' SCOUTS ARE NOT HOPEFUL.",
  "IGOR WAS OBSERVED NEAR A BUTTON. HE HAS BEEN OBSERVED.",
  "SUPPLY LINES (SNACKS) REMAIN INTACT AND ENTIRELY UNUSED.",
  "A CALENDAR INVITE WAS DRAFTED, THEN ABANDONED. WINTER APPROACHES.",
  "THE DICE HAVE NOT BEEN ROLLED. THE DICE DO NOT FORGET.",
  "COMMAND REVIEWED THE SITUATION AND SCHEDULED A REVIEW OF THE REVIEW.",
  "NO CONTACT WITH GAME NIGHT. TRANSMITTING SHAME ON ALL FREQUENCIES.",
  "TROOPS ASKED 'WHAT ARE WE EVEN WAITING FOR.' NO ANSWER CAME.",
];

const { level, label } = defcon(days);
const memo = `DAY ${days}: ${MEMOS[days % MEMOS.length]}`;
const morale = Math.max(0, 100 - days);

const status = {
  service: "general-orders-drought-monitor",
  version: "4.2.0-hotfix.7",
  generated_at: now.toISOString(),
  last_played: lastPlayedStr,
  days_since_played: days,
  defcon: level,
  defcon_label: label,
  morale_percent: morale,
  memo,
  sla: "99.999% (of days, no game was played, meeting our target)",
};

writeFileSync("status.json", JSON.stringify(status, null, 2) + "\n");

const entry = `\n## DAY ${days} — ${todayStr}\n\n> ${memo}\n>\n> DEFCON ${level} — ${label}. Morale: ${morale}%.\n`;

if (!existsSync("WAR_JOURNAL.md")) {
  writeFileSync(
    "WAR_JOURNAL.md",
    "# THE WAR JOURNAL\n\nOfficial daily record of the General Orders drought.\nMaintained automatically by a robot with nothing better to do.\n"
  );
}
appendFileSync("WAR_JOURNAL.md", entry);

console.log(`Report filed for day ${days}. DEFCON ${level}. Memo: ${memo}`);
