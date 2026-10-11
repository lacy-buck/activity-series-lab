export type Sym = "Kr" | "Vm" | "Om" | "Qn" | "Zb" | "Th";

export interface Element {
  sym: Sym;
  name: string;
  /** 1 = most active */
  rank: number;
  metalLook: string;
  ionColorName: string;
  ionColor: string; // css var name
  charge: number;
}

export const ELEMENTS: Record<Sym, Element> = {
  Kr: { sym: "Kr", name: "Kryllite", rank: 1, metalLook: "silvery-white", ionColorName: "colorless", ionColor: "var(--sol-clear)", charge: 1 },
  Vm: { sym: "Vm", name: "Velmar", rank: 2, metalLook: "dull gray", ionColorName: "pale green", ionColor: "var(--sol-green)", charge: 2 },
  Om: { sym: "Om", name: "Ombrium", rank: 3, metalLook: "bluish-black", ionColorName: "colorless", ionColor: "var(--sol-clear)", charge: 2 },
  Qn: { sym: "Qn", name: "Quarnite", rank: 4, metalLook: "reddish-brown", ionColorName: "blue", ionColor: "var(--sol-blue)", charge: 2 },
  Zb: { sym: "Zb", name: "Zorbium", rank: 5, metalLook: "black, crumbly", ionColorName: "pink", ionColor: "var(--sol-pink)", charge: 3 },
  Th: { sym: "Th", name: "Thessium", rank: 6, metalLook: "shiny gold-colored", ionColorName: "amber", ionColor: "var(--sol-amber)", charge: 1 },
};

export const PART1_METALS: Sym[] = ["Kr", "Vm", "Zb", "Th"];
export const SOLUTIONS: Sym[] = ["Kr", "Vm", "Qn", "Zb", "Th"];
export const PART1_SERIES: Sym[] = ["Kr", "Vm", "Qn", "Zb", "Th"];
export const FULL_SERIES: Sym[] = ["Kr", "Vm", "Om", "Qn", "Zb", "Th"];
export const OM_TEST_LIMIT = 2;

/** A metal replaces the metal ion in solution only if it is more active (higher in the series). */
export function reacts(metal: Sym, ion: Sym): boolean {
  return ELEMENTS[metal].rank < ELEMENTS[ion].rank;
}

const SUB = ["", "", "₂", "₃"];
const SUP = ["", "⁺", "²⁺", "³⁺"];
export function solutionName(ion: Sym) {
  return `${ion}Cl${SUB[ELEMENTS[ion].charge]}`;
}
export function ionName(sym: Sym) {
  return `${sym}${SUP[ELEMENTS[sym].charge]}`;
}

export function observation(metal: Sym, ion: Sym): string {
  const m = ELEMENTS[metal];
  const i = ELEMENTS[ion];
  if (!reacts(metal, ion)) {
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

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    prompt: "A strip of Velmar (Vm) is placed in ZbCl₃ and a reaction occurs. Which particles LOSE electrons?",
    options: ["Zb³⁺ ions", "Vm atoms", "Cl⁻ ions", "Zb atoms"],
    answer: 1,
    explain: "Vm is higher in the series, so Vm atoms give up electrons and become Vm²⁺ ions (oxidation).",
  },
  {
    id: "q2",
    prompt: "In that same reaction, electrons move…",
    options: ["from Zb³⁺ ions to Vm atoms", "from Cl⁻ ions to Vm atoms", "from Vm atoms to Zb³⁺ ions", "electrons do not move"],
    answer: 2,
    explain: "The more active metal atom hands its electrons to the less active metal's ion.",
  },
  {
    id: "q3",
    prompt: "A strip of Zorbium (Zb) is placed in ThCl and a reaction occurs. Zorbium ions have a 3+ charge (Zb³⁺). How many electrons does each Zb atom LOSE?",
    options: ["1", "2", "3", "6"],
    answer: 2,
    explain: "Zb → Zb³⁺ + 3e⁻. A neutral atom that becomes a 3+ ion has lost 3 electrons.",
  },
  {
    id: "q4",
    prompt: "What is the black, crumbly coating that forms on the Vm strip?",
    options: ["Velmar metal", "Zorbium metal", "Salt crystals", "Rust"],
    answer: 1,
    explain: "Zb³⁺ ions picked up electrons and turned into solid Zb, which coats the strip.",
  },
  {
    id: "q5",
    prompt: "Which ion is a spectator in Vm + ZbCl₃?",
    options: ["Vm²⁺", "Zb³⁺", "Cl⁻", "There is no spectator"],
    answer: 2,
    explain: "Chloride is in the solution before and after, unchanged. It doesn't gain or lose electrons.",
  },
  {
    id: "q6",
    prompt: "Why did Thessium (Th) show NO reaction in KrCl?",
    options: [
      "Th atoms hold their electrons more tightly than Kr atoms do, so Kr⁺ can't take electrons from Th",
      "Kr⁺ ions have too many electrons",
      "Chloride blocks the reaction",
      "Th is more active than Kr",
    ],
    answer: 0,
    explain: "Kr is more active and gives up electrons more easily. Its ions won't pull electrons off a less active metal like Th.",
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
    prompt: "Velmar (Vm) reacts with ZbCl₃. Velmar ions have a 2+ charge (Vm²⁺). How many electrons does ONE Vm atom give up?",
    options: ["1", "2", "3", "6"],
    answer: 1,
    explain: "Vm → Vm²⁺ + 2e⁻. A neutral Vm atom becomes a 2+ ion by giving up 2 electrons.",
  },
];

export const WRITTEN_PROMPT =
  "In your own words: A strip of Kryllite (Kr) is placed in ThCl. Describe what happens to the electrons, which particle is oxidized, which is reduced, and what you would see.";

/** Fixed clues for the final metal (Ombrium). */
export const OM_CLUES = [
  { text: "Velmar (Vm) metal placed in OmCl₂ solution: a bluish-black coating formed.", metal: "Vm" as Sym, ion: "Om" as Sym },
  { text: "Ombrium (Om) metal placed in QnCl₂ solution: a reddish-brown coating formed and the blue color faded.", metal: "Om" as Sym, ion: "Qn" as Sym },
];
