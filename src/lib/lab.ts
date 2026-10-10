export type Sym = "Kr" | "Vm" | "Om" | "Qn" | "Zb" | "Th";

export interface Element {
  sym: Sym;
  name: string;
  /** 1 = most active */
  rank: number;
  metalLook: string;
  ionColorName: string;
  ionColor: string; // css var name
}

export const ELEMENTS: Record<Sym, Element> = {
  Kr: { sym: "Kr", name: "Kryllite", rank: 1, metalLook: "silvery-white", ionColorName: "colorless", ionColor: "var(--sol-clear)" },
  Vm: { sym: "Vm", name: "Velmar", rank: 2, metalLook: "dull gray", ionColorName: "pale green", ionColor: "var(--sol-green)" },
  Om: { sym: "Om", name: "Ombrium", rank: 3, metalLook: "bluish-black", ionColorName: "colorless", ionColor: "var(--sol-clear)" },
  Qn: { sym: "Qn", name: "Quarnite", rank: 4, metalLook: "reddish-brown", ionColorName: "blue", ionColor: "var(--sol-blue)" },
  Zb: { sym: "Zb", name: "Zorbium", rank: 5, metalLook: "black, crumbly", ionColorName: "pink", ionColor: "var(--sol-pink)" },
  Th: { sym: "Th", name: "Thessium", rank: 6, metalLook: "shiny gold-colored", ionColorName: "amber", ionColor: "var(--sol-amber)" },
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

export function solutionName(ion: Sym) {
  return `${ion}(NO₃)₂`;
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
    [a[i], a[j]] = [a[j], a[i]];
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
    prompt: "A strip of Velmar (Vm) is placed in Zb(NO₃)₂ and a reaction occurs. Which particles LOSE electrons?",
    options: ["Zb²⁺ ions", "Vm atoms", "NO₃⁻ ions", "Zb atoms"],
    answer: 1,
    explain: "Vm is higher in the series, so Vm atoms give up electrons and become Vm²⁺ ions (oxidation).",
  },
  {
    id: "q2",
    prompt: "In that same reaction, electrons move…",
    options: ["from Zb²⁺ ions to Vm atoms", "from NO₃⁻ ions to Vm atoms", "from Vm atoms to Zb²⁺ ions", "electrons do not move"],
    answer: 2,
    explain: "The more active metal atom hands its electrons to the less active metal's ion.",
  },
  {
    id: "q3",
    prompt: "Which half-reaction shows what happens to the Zb²⁺ ions?",
    options: ["Zb²⁺ + 2e⁻ → Zb", "Zb → Zb²⁺ + 2e⁻", "Vm → Vm²⁺ + 2e⁻", "Zb²⁺ → Zb + 2e⁻"],
    answer: 0,
    explain: "Zb²⁺ ions GAIN 2 electrons (reduction) and become neutral Zb metal.",
  },
  {
    id: "q4",
    prompt: "What is the black, crumbly coating that forms on the Vm strip?",
    options: ["Velmar metal", "Zorbium metal", "Nitrate crystals", "Rust"],
    answer: 1,
    explain: "Zb²⁺ ions picked up electrons and turned into solid Zb, which coats the strip.",
  },
  {
    id: "q5",
    prompt: "Which ion is a spectator in Vm + Zb(NO₃)₂?",
    options: ["Vm²⁺", "Zb²⁺", "NO₃⁻", "There is no spectator"],
    answer: 2,
    explain: "Nitrate is in the solution before and after, unchanged. It doesn't gain or lose electrons.",
  },
  {
    id: "q6",
    prompt: "Why did Thessium (Th) show NO reaction in Kr(NO₃)₂?",
    options: [
      "Th atoms hold their electrons more tightly than Kr atoms do, so Kr²⁺ can't take electrons from Th",
      "Kr²⁺ ions have too many electrons",
      "Nitrate blocks the reaction",
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
    prompt: "Ombrium metal is placed in blue Qn(NO₃)₂. Ombrium ions are colorless. What would you observe?",
    options: [
      "No change",
      "A reddish-brown coating forms and the blue color fades",
      "A bluish-black coating forms and the solution turns pink",
      "The solution turns blue",
    ],
    answer: 1,
    explain: "Om gives electrons to Qn²⁺, so Qn metal (reddish-brown) deposits and blue Qn²⁺ ions are replaced by colorless Om²⁺.",
  },
];

export const WRITTEN_PROMPT =
  "In your own words: A strip of Kryllite (Kr) is placed in Th(NO₃)₂. Describe what happens to the electrons, which particle is oxidized, which is reduced, and what you would see.";
