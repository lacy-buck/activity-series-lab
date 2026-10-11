export type Sym = "Kr" | "Vm" | "Om" | "Qn" | "Zb" | "Th";

export interface Element {
  sym: Sym;
  name: string;
  metalLook: string;
  ionColorName: string;
  ionColor: string; // css var name
  charge: number;
}

export const ELEMENTS: Record<Sym, Element> = {
  Kr: { sym: "Kr", name: "Kryllite", metalLook: "silvery-white", ionColorName: "colorless", ionColor: "var(--sol-clear)", charge: 1 },
  Vm: { sym: "Vm", name: "Velmar", metalLook: "dull gray", ionColorName: "pale green", ionColor: "var(--sol-green)", charge: 2 },
  Om: { sym: "Om", name: "Ombrium", metalLook: "bluish-black", ionColorName: "colorless", ionColor: "var(--sol-clear)", charge: 2 },
  Qn: { sym: "Qn", name: "Quarnite", metalLook: "reddish-brown", ionColorName: "blue", ionColor: "var(--sol-blue)", charge: 2 },
  Zb: { sym: "Zb", name: "Zorbium", metalLook: "black, crumbly", ionColorName: "pink", ionColor: "var(--sol-pink)", charge: 3 },
  Th: { sym: "Th", name: "Thessium", metalLook: "shiny gold-colored", ionColorName: "amber", ionColor: "var(--sol-amber)", charge: 1 },
};

/** Qn only comes as a solution; Om is the late "limited data" metal. */
export const PART1_METALS: Sym[] = ["Kr", "Vm", "Zb", "Th"];
export const SOLUTIONS: Sym[] = ["Kr", "Vm", "Qn", "Zb", "Th"];
export const MAX_ATTEMPTS = 3;

type Pair = { m: Sym; i: Sym };
interface ScenarioDef {
  /** most active → least active */
  series: Sym[];
  main: Pair; // reacting pair used for electron questions
  lose: Pair; // reacting pair for "how many electrons lost"
  nr: Pair; // non-reacting pair
}

/** One activity series per attempt. Om's upper neighbour must have a metal strip (not Qn). */
export const SCENARIOS: ScenarioDef[] = [
  { series: ["Kr", "Vm", "Om", "Qn", "Zb", "Th"], main: { m: "Vm", i: "Zb" }, lose: { m: "Zb", i: "Th" }, nr: { m: "Th", i: "Kr" } },
  { series: ["Zb", "Th", "Qn", "Kr", "Om", "Vm"], main: { m: "Zb", i: "Kr" }, lose: { m: "Th", i: "Vm" }, nr: { m: "Vm", i: "Th" } },
  { series: ["Th", "Qn", "Zb", "Om", "Vm", "Kr"], main: { m: "Th", i: "Zb" }, lose: { m: "Zb", i: "Vm" }, nr: { m: "Kr", i: "Th" } },
];

/** A metal replaces the metal ion in solution only if it is more active (higher in the series). */
export function reacts(series: Sym[], metal: Sym, ion: Sym): boolean {
  return series.indexOf(metal) < series.indexOf(ion);
}

const SUB = ["", "", "₂", "₃"];
const SUP = ["", "⁺", "²⁺", "³⁺"];
export function solutionName(ion: Sym) {
  return `${ion}Cl${SUB[ELEMENTS[ion].charge]}`;
}
export function ionName(sym: Sym) {
  return `${sym}${SUP[ELEMENTS[sym].charge]}`;
}

export function observation(series: Sym[], metal: Sym, ion: Sym): string {
  const m = ELEMENTS[metal];
  const i = ELEMENTS[ion];
  if (!reacts(series, metal, ion)) {
    return `The ${m.name} strip stays ${m.metalLook}. The ${i.ionColorName} solution looks the same after 5 minutes.`;
  }
  const colorChange =
    i.ionColorName === m.ionColorName
      ? `stays ${i.ionColorName}`
      : `slowly changes from ${i.ionColorName} to ${m.ionColorName}`;
  return `A ${i.metalLook} coating builds up on the ${m.name} strip. The solution ${colorChange}.`;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i] as T; a[i] = a[j] as T; a[j] = t;
  }
  return a;
}

export interface Question {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface Clue { text: string; metal: Sym; ion: Sym }

export interface Scenario {
  full: Sym[];
  part1: Sym[];
  clues: Clue[];
  questions: Question[];
}

const N = (s: Sym) => ELEMENTS[s].name;
const COUNTS = ["1", "2", "3", "6"];
const countIdx = (n: number) => COUNTS.indexOf(String(n));

function omClues(series: Sym[]): Clue[] {
  const k = series.indexOf("Om");
  const above = series[k - 1] as Sym;
  const below = series[k + 1] as Sym;
  const b = ELEMENTS[below];
  const color = b.ionColorName === ELEMENTS.Om.ionColorName ? "" : ` and the ${b.ionColorName} color faded`;
  return [
    { metal: above, ion: "Om", text: `${N(above)} (${above}) metal placed in OmCl₂ solution: a bluish-black coating formed.` },
    { metal: "Om", ion: below, text: `Ombrium (Om) metal placed in ${solutionName(below)} solution: a ${b.metalLook} coating formed${color}.` },
  ];
}

function predictions(series: Sym[], clues: Clue[]): Question[] {
  const used = new Set(clues.map((c) => `${c.metal}|${c.ion}`));
  const pick = (metal: Sym, want: boolean, skip: Set<string>) =>
    series.find((ion) => ion !== metal && !used.has(`${metal}|${ion}`) && !skip.has(`${metal}|${ion}`) && reacts(series, metal, ion) === want);
  const chosen: Pair[] = [];
  const skip = new Set<string>();
  const plan: [Sym, boolean][] = [["Om", true], ["Qn", false], ["Om", false], ["Qn", true]];
  for (const [metal, want] of plan) {
    const ion = pick(metal, want, skip) ?? pick(metal === "Om" ? "Qn" : "Om", want, skip);
    const m = pick(metal, want, skip) ? metal : metal === "Om" ? "Qn" : "Om";
    if (ion) { chosen.push({ m, i: ion }); skip.add(`${m}|${ion}`); }
  }
  return chosen.map(({ m, i }, n) => {
    const yes = reacts(series, m, i);
    return {
      id: `p${n}`,
      prompt: `Predict: ${N(m)} (${m}) metal is placed in ${solutionName(i)}. Will a reaction occur?`,
      options: ["Yes — a reaction occurs", "No — no reaction"],
      answer: yes ? 0 : 1,
      explain: yes
        ? `${m} is above ${i} in the series, so ${m} atoms give electrons to ${ionName(i)} ions and ${N(i)} metal forms.`
        : `${m} is below ${i} in the series, so ${m} atoms can't give electrons to ${ionName(i)} ions. NR.`,
    };
  });
}

export function buildScenario(attempt: number): Scenario {
  const def = SCENARIOS[attempt % SCENARIOS.length] as ScenarioDef;
  const full = def.series;
  const { main, lose, nr } = def;
  const mc = ELEMENTS[main.m].charge;
  const ic = ELEMENTS[main.i].charge;
  const lc = ELEMENTS[lose.m].charge;
  const clues = omClues(full);
  const target = full[2] as Sym;
  const questions: Question[] = [
    {
      id: "q1",
      prompt: `A strip of ${N(main.m)} (${main.m}) is placed in ${solutionName(main.i)} and a reaction occurs. Which particles LOSE electrons?`,
      options: [`${ionName(main.i)} ions`, `${main.m} atoms`, "Cl⁻ ions", `${main.i} atoms`],
      answer: 1,
      explain: `${main.m} is higher in the series, so ${main.m} atoms give up electrons and become ${ionName(main.m)} ions (oxidation).`,
    },
    {
      id: "q2",
      prompt: "In that same reaction, electrons move…",
      options: [`from ${ionName(main.i)} ions to ${main.m} atoms`, `from Cl⁻ ions to ${main.m} atoms`, `from ${main.m} atoms to ${ionName(main.i)} ions`, "electrons do not move"],
      answer: 2,
      explain: "The more active metal atom hands its electrons to the less active metal's ion.",
    },
    {
      id: "q3",
      prompt: `A strip of ${N(lose.m)} (${lose.m}) is placed in ${solutionName(lose.i)} and a reaction occurs. ${N(lose.m)} ions have a ${lc}+ charge (${ionName(lose.m)}). How many electrons does each ${lose.m} atom LOSE?`,
      options: COUNTS,
      answer: countIdx(lc),
      explain: `${lose.m} → ${ionName(lose.m)} + ${lc}e⁻. A neutral atom that becomes a ${lc}+ ion has lost ${lc} electron${lc > 1 ? "s" : ""}.`,
    },
    {
      id: "q4",
      prompt: `In ${main.m} + ${solutionName(main.i)}, what is the ${ELEMENTS[main.i].metalLook} coating that forms on the ${main.m} strip?`,
      options: [`${N(main.m)} metal`, `${N(main.i)} metal`, "Salt crystals", "Rust"],
      answer: 1,
      explain: `${ionName(main.i)} ions picked up electrons and turned into solid ${main.i}, which coats the strip.`,
    },
    {
      id: "q5",
      prompt: `Which ion is a spectator in ${main.m} + ${solutionName(main.i)}?`,
      options: [ionName(main.m), ionName(main.i), "Cl⁻", "There is no spectator"],
      answer: 2,
      explain: "Chloride is in the solution before and after, unchanged. It doesn't gain or lose electrons.",
    },
    {
      id: "q6",
      prompt: `Why did ${N(nr.m)} (${nr.m}) show NO reaction in ${solutionName(nr.i)}?`,
      options: [
        `${nr.m} atoms hold their electrons more tightly than ${nr.i} atoms do, so ${ionName(nr.i)} can't take electrons from ${nr.m}`,
        `${ionName(nr.i)} ions have too many electrons`,
        "Chloride blocks the reaction",
        `${nr.m} is more active than ${nr.i}`,
      ],
      answer: 0,
      explain: `${nr.i} is more active and gives up electrons more easily. Its ions won't pull electrons off a less active metal like ${nr.m}.`,
    },
    {
      id: "q7",
      prompt: "A metal near the TOP of an activity series is one that…",
      options: ["gains electrons most easily", "loses electrons most easily", "never reacts", "is always a solution"],
      answer: 1,
      explain: "More active = more easily oxidized = loses electrons more readily.",
    },
    {
      id: "q8",
      prompt: `${N(main.m)} (${main.m}) reacts with ${solutionName(main.i)}. ${N(main.m)} ions have a ${mc}+ charge (${ionName(main.m)}). How many electrons does ONE ${main.m} atom give up?`,
      options: COUNTS,
      answer: countIdx(mc),
      explain: `${main.m} → ${ionName(main.m)} + ${mc}e⁻. A neutral ${main.m} atom becomes a ${mc}+ ion by giving up ${mc} electron${mc > 1 ? "s" : ""}.`,
    },
    {
      id: "q9",
      prompt: `In that same reaction (${main.m} + ${solutionName(main.i)}), how many electrons does ONE ${main.i} ion gain?`,
      options: COUNTS,
      answer: countIdx(ic),
      explain: `${ionName(main.i)} + ${ic}e⁻ → ${main.i}. The ${main.i} ion has a ${ic}+ charge, so it must gain ${ic} electron${ic > 1 ? "s" : ""} to become a neutral ${main.i} atom.`,
    },
    ...predictions(full, clues),
    {
      id: "q14",
      prompt: `Which metal could replace ${N(target)} from ${solutionName(target)} solution?`,
      options: [full[3], full[4], full[0], full[5]].map((s) => `${N(s as Sym)} (${s})`),
      answer: 2,
      explain: `Only metals ABOVE ${target} in the series (${full[0]} and ${full[1]}) can give electrons to ${ionName(target)}. ${full[0]} is the only choice above ${target}.`,
    },
  ];
  return { full, part1: full.filter((s) => s !== "Om"), clues, questions };
}
