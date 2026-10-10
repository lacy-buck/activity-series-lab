import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, FlaskConical, Table2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Beaker } from "@/components/lab/Beaker";
import { DataTable, key, type Records } from "@/components/lab/DataTable";
import {
  ELEMENTS, FULL_SERIES, OM_CLUES, PART1_METALS, PART1_SERIES, QUESTIONS, SOLUTIONS,
  observation, reacts, shuffle, type Sym,
} from "@/lib/lab";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Metal Mystery Lab — Build an Activity Series" },
      { name: "description", content: "Run single replacement tests on fictional metals, record data, build an activity series, and explain electron transfer." },
      { property: "og:title", content: "Metal Mystery Lab — Build an Activity Series" },
      { property: "og:description", content: "A virtual chemistry lab for practicing activity series and electron transfer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Lab,
});

const STEPS = ["Intro", "Experiment", "Activity series", "New metal", "Electrons"];
const TOTAL_TESTS = PART1_METALS.length * (SOLUTIONS.length - 1);
const STORE = "metal-lab-v1";

interface State {
  step: number;
  records: Records;
  series: Sym[];
  seriesDone: boolean;
  omSlot: number | null;
  omDone: boolean;
  answers: Record<string, number>;
}

const fresh = (): State => ({
  step: 0, records: {}, series: shuffle(PART1_SERIES), seriesDone: false,
  omSlot: null, omDone: false, answers: {},
});

function Lab() {
  const [s, setS] = useState<State>(fresh);
  const [loaded, setLoaded] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) setS(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(STORE, JSON.stringify(s));
  }, [s, loaded]);

  const up = (p: Partial<State>) => setS((o) => ({ ...o, ...p }));
  const recorded = Object.keys(s.records).length;

  return (
    <div className="min-h-screen pb-24">
      <header className="border-b border-border bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Metal Mystery Lab</h1>
          </div>
          <nav className="flex flex-wrap gap-1">
            {STEPS.map((label, i) => (
              <button
                key={label}
                disabled={i > maxStep(s)}
                onClick={() => up({ step: i })}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-40",
                  s.step === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent",
                )}
              >
                {i + 1}. {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {s.step === 0 && <Intro onStart={() => up({ step: 1 })} />}
        {s.step === 1 && (
          <Experiment records={s.records} setRecords={(records) => up({ records })} onNext={() => up({ step: 2 })} done={recorded === TOTAL_TESTS} />
        )}
        {s.step === 2 && <SeriesStep s={s} up={up} />}
        {s.step === 3 && <OmStep s={s} up={up} />}
        {s.step === 4 && <Questions answers={s.answers} setAnswers={(answers) => up({ answers })} onReset={() => { localStorage.removeItem(STORE); setS(fresh()); }} />}
      </main>

      {s.step > 1 && (
        <>
          <Button variant="default" className="fixed bottom-5 right-5 z-30 rounded-full shadow-lg" onClick={() => setTableOpen(true)}>
            <Table2 className="h-4 w-4" /> My data table
          </Button>
          {tableOpen && (
            <div className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/30 p-4 sm:items-center" onClick={() => setTableOpen(false)}>
              <div className="notebook w-full max-w-3xl rounded-xl p-5" onClick={(e) => e.stopPropagation()}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold">My data table</h2>
                  <button onClick={() => setTableOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
                </div>
                <DataTable metals={PART1_METALS} records={s.records} />
                {s.step >= 3 && <OmClues />}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function maxStep(s: State) {
  if (s.omDone) return 4;
  if (s.seriesDone) return 3;
  if (Object.keys(s.records).length === TOTAL_TESTS) return 2;
  if (s.step >= 1) return 1;
  return 0;
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("notebook rounded-xl p-6", className)}>{children}</section>;
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <Card className="mx-auto max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">Single replacement lab</p>
      <h2 className="mt-2 text-3xl font-bold">Which metal is the most active?</h2>
      <p className="mt-4 text-muted-foreground">
        A lab just received samples of newly discovered metals. Your job: drop each metal strip into each metal chloride solution, watch carefully, and record whether a reaction happens.
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        <li>• <b>Metals you have:</b> {PART1_METALS.map((m) => `${ELEMENTS[m].name} (${m})`).join(", ")}</li>
        <li>• <b>Solutions you have:</b> {SOLUTIONS.map((m) => `${m}Cl₂`).join(", ")}</li>
        <li>• <b>Catch:</b> Quarnite (Qn) only came as a solution — there's no Qn metal strip to test.</li>
        <li>• <b>Signs of a reaction:</b> a new solid coating forms on the strip, or the solution color changes.</li>
      </ul>
      <Button size="lg" className="mt-6" onClick={onStart}>Start the experiment</Button>
    </Card>
  );
}

function Experiment({ records, setRecords, onNext, done }: { records: Records; setRecords: (r: Records) => void; onNext: () => void; done: boolean }) {
  const [metal, setMetal] = useState<Sym>("Kr");
  const [ion, setIon] = useState<Sym>("Vm");
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { setRunning(false); setFinished(false); setMsg(null); }, [metal, ion]);

  const run = () => {
    setRunning(true); setFinished(false); setMsg(null);
    setTimeout(() => setFinished(true), 2600);
  };
  const mark = (v: "R" | "NR") => {
    const correct = reacts(metal, ion) ? "R" : "NR";
    if (v !== correct) { setMsg("Look at your observation again — does it describe any change?"); return; }
    setRecords({ ...records, [key(metal, ion)]: v });
    setMsg("Recorded! Pick your next test.");
  };
  const k = key(metal, ion);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <Card>
        <h2 className="text-xl font-bold">Lab bench</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose a metal strip and a solution, then run the test.</p>
        <Picker label="Metal strip" items={PART1_METALS} value={metal} onChange={setMetal} />
        <Picker label="Solution" items={SOLUTIONS} value={ion} onChange={setIon} suffix="Cl₂" disabled={(x) => x === metal} />
        <div className="my-6"><Beaker metal={metal} ion={ion} running={running} /></div>
        {metal === ion ? (
          <p className="text-center text-sm text-muted-foreground">A metal in its own solution won't tell you anything — pick a different solution.</p>
        ) : !running ? (
          <Button className="w-full" onClick={run}>Drop {ELEMENTS[metal].name} into {ion}Cl₂</Button>
        ) : !finished ? (
          <p className="text-center font-mono text-sm text-muted-foreground">Observing for 5 minutes…</p>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg bg-secondary p-3 text-sm"><b>Observation:</b> {observation(metal, ion)}</div>
            {records[k] ? (
              <p className="text-center text-sm text-success">Already recorded in your table.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => mark("R")}>✓ Reaction</Button>
                <Button variant="outline" onClick={() => mark("NR")}>✗ No reaction</Button>
              </div>
            )}
          </div>
        )}
        {msg && <p className="mt-3 text-center text-sm font-medium text-primary">{msg}</p>}
      </Card>
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Data table</h2>
          <span className="font-mono text-sm text-muted-foreground">{Object.keys(records).length}/{TOTAL_TESTS} tests</span>
        </div>
        <div className="mt-4"><DataTable metals={PART1_METALS} records={records} highlight={metal !== ion ? k : undefined} /></div>
        {done && (
          <div className="mt-6 rounded-lg bg-accent p-4">
            <p className="font-medium text-accent-foreground">All tests recorded! Time to rank the metals.</p>
            <Button className="mt-3" onClick={onNext}>Build the activity series →</Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function Picker({ label, items, value, onChange, suffix = "", disabled }: { label: string; items: Sym[]; value: Sym; onChange: (s: Sym) => void; suffix?: string; disabled?: (s: Sym) => boolean }) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((x) => (
          <button
            key={x}
            disabled={disabled?.(x)}
            onClick={() => onChange(x)}
            className={cn(
              "rounded-md border px-3 py-1.5 font-mono text-sm transition-colors disabled:opacity-30",
              value === x ? "border-primary bg-primary text-primary-foreground" : "border-border bg-paper hover:bg-accent",
            )}
          >
            {x}{suffix}
          </button>
        ))}
      </div>
    </div>
  );
}

function OrderList({ items, onMove, highlight }: { items: Sym[]; onMove?: (i: number, d: -1 | 1) => void; highlight?: Sym }) {
  return (
    <ol className="space-y-2">
      {items.map((x, i) => (
        <li key={x} className={cn("flex items-center gap-3 rounded-lg border border-border bg-paper p-3", highlight === x && "border-primary bg-accent")}>
          <span className="w-6 font-mono text-sm text-muted-foreground">{i + 1}</span>
          <span className="font-mono text-lg font-bold">{x}</span>
          <span className="flex-1 text-sm text-muted-foreground">{ELEMENTS[x].name}{x === "Qn" && " (solution data only)"}</span>
          {onMove && (
            <span className="flex gap-1">
              <Button size="icon" variant="ghost" disabled={i === 0} onClick={() => onMove(i, -1)} aria-label="Move up"><ArrowUp className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" disabled={i === items.length - 1} onClick={() => onMove(i, 1)} aria-label="Move down"><ArrowDown className="h-4 w-4" /></Button>
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

function SeriesStep({ s, up }: { s: State; up: (p: Partial<State>) => void }) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const move = (i: number, d: -1 | 1) => {
    const a = [...s.series];
    [a[i], a[i + d]] = [a[i + d], a[i]];
    up({ series: a }); setFeedback(null);
  };
  const check = () => {
    const right = s.series.filter((x, i) => x === PART1_SERIES[i]).length;
    if (right === PART1_SERIES.length) { up({ seriesDone: true }); setFeedback(null); return; }
    const qnOff = s.series.indexOf("Qn") !== PART1_SERIES.indexOf("Qn");
    setFeedback(
      `${right} of ${PART1_SERIES.length} are in the right spot. ` +
        (qnOff
          ? "Hint for Qn: you only have its solution. Look down the QnCl₂ column — which metals were active enough to replace Qn, and which weren't?"
          : "Hint: count the ✓ marks in each metal's row. More ✓ = more active."),
    );
  };
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <h2 className="text-xl font-bold">Build the activity series</h2>
        <p className="mt-1 text-sm text-muted-foreground">Arrange from <b>most active (top)</b> to <b>least active (bottom)</b>.</p>
        <div className="mt-4"><OrderList items={s.series} onMove={s.seriesDone ? undefined : move} /></div>
        {!s.seriesDone ? (
          <Button className="mt-4" onClick={check}>Check my series</Button>
        ) : (
          <div className="mt-4 rounded-lg bg-accent p-4">
            <p className="font-medium text-accent-foreground">Correct! Qn fits between Vm and Zb: Vm metal replaced Qn²⁺, but Zb metal could not.</p>
            <Button className="mt-3" onClick={() => up({ step: 3 })}>A new metal arrives →</Button>
          </div>
        )}
        {feedback && <p className="mt-3 text-sm text-primary">{feedback}</p>}
      </Card>
      <Card><h2 className="mb-4 text-xl font-bold">Your data</h2><DataTable metals={PART1_METALS} records={s.records} /></Card>
    </div>
  );
}

function OmClues() {
  return (
    <div className="mt-4 rounded-lg border border-dashed border-primary p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">Ombrium (Om) — limited data</p>
      <ul className="mt-2 space-y-1 text-sm">{OM_CLUES.map((c) => <li key={c.text}>• {c.text}</li>)}</ul>
    </div>
  );
}

function OmStep({ s, up }: { s: State; up: (p: Partial<State>) => void }) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const correctSlot = FULL_SERIES.indexOf("Om");
  const preview = s.omSlot === null ? PART1_SERIES : [...PART1_SERIES.slice(0, s.omSlot), "Om" as Sym, ...PART1_SERIES.slice(s.omSlot)];
  const check = () => {
    if (s.omSlot === correctSlot) { up({ omDone: true }); setFeedback(null); }
    else setFeedback("Not quite. For each clue, ask: which substance was the metal, and which was the ion? The metal that gives up electrons is the more active one.");
  };
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <h2 className="text-xl font-bold">Place the new metal</h2>
        <p className="mt-1 text-sm text-muted-foreground">A tiny sample of Ombrium (Om) arrived — only enough for two tests, which were already done for you. Use the clues to place it.</p>
        <OmClues />
        <p className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Where does Om go?</p>
        <div className="space-y-1">
          {Array.from({ length: PART1_SERIES.length + 1 }).map((_, i) => (
            <div key={i}>
              <button
                disabled={s.omDone}
                onClick={() => { up({ omSlot: i }); setFeedback(null); }}
                className={cn(
                  "w-full rounded-md border border-dashed py-1 text-xs transition-colors",
                  s.omSlot === i ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-accent",
                )}
              >
                {i === 0 ? "Above Kr (most active)" : i === PART1_SERIES.length ? "Below Th (least active)" : `Between ${PART1_SERIES[i - 1]} and ${PART1_SERIES[i]}`}
              </button>
              {i < PART1_SERIES.length && <div className="py-1 pl-3 font-mono text-sm font-bold">{PART1_SERIES[i]}</div>}
            </div>
          ))}
        </div>
        {!s.omDone ? (
          <Button className="mt-4" disabled={s.omSlot === null} onClick={check}>Check placement</Button>
        ) : (
          <div className="mt-4 rounded-lg bg-accent p-4 text-sm text-accent-foreground">
            <p className="font-medium">Correct! Vm gave electrons to Om²⁺, so Vm is more active than Om. Om gave electrons to Qn²⁺, so Om is more active than Qn.</p>
            <Button className="mt-3" onClick={() => up({ step: 4 })}>Explain the electrons →</Button>
          </div>
        )}
        {feedback && <p className="mt-3 text-sm text-primary">{feedback}</p>}
      </Card>
      <Card>
        <h2 className="mb-4 text-xl font-bold">Updated series</h2>
        <OrderList items={preview} highlight="Om" />
      </Card>
    </div>
  );
}

function Questions({ answers, setAnswers, onReset }: { answers: Record<string, number>; setAnswers: (a: Record<string, number>) => void; onReset: () => void }) {
  const answered = QUESTIONS.filter((q) => answers[q.id] !== undefined);
  const score = answered.filter((q) => answers[q.id] === q.answer).length;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4">
        <Card>
          <h2 className="text-xl font-bold">What's happening to the electrons?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use your final activity series to answer. You'll see feedback right away.</p>
        </Card>
        {QUESTIONS.map((q, n) => {
          const picked = answers[q.id];
          const done = picked !== undefined;
          return (
            <Card key={q.id}>
              <p className="font-medium"><span className="font-mono text-primary">{n + 1}.</span> {q.prompt}</p>
              <div className="mt-3 grid gap-2">
                {q.options.map((o, i) => (
                  <button
                    key={o}
                    disabled={done}
                    onClick={() => setAnswers({ ...answers, [q.id]: i })}
                    className={cn(
                      "rounded-lg border p-3 text-left text-sm transition-colors",
                      !done && "border-border bg-paper hover:bg-accent",
                      done && i === q.answer && "border-success bg-success/10",
                      done && i === picked && i !== q.answer && "border-destructive bg-destructive/10",
                      done && i !== picked && i !== q.answer && "border-border opacity-60",
                    )}
                  >
                    {o}
                  </button>
                ))}
              </div>
              {done && (
                <p className={cn("mt-3 text-sm", picked === q.answer ? "text-success" : "text-destructive")}>
                  {picked === q.answer ? "Correct. " : "Not quite. "}<span className="text-foreground">{q.explain}</span>
                </p>
              )}
            </Card>
          );
        })}
      </div>
      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Final series</p>
          <ol className="mt-2 space-y-1 font-mono text-sm">
            {FULL_SERIES.map((x, i) => <li key={x}>{i + 1}. <b>{x}</b> <span className="font-sans text-muted-foreground">{ELEMENTS[x].name}</span></li>)}
          </ol>
          <p className="mt-2 text-xs text-muted-foreground">↑ loses electrons most easily</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</p>
          <p className="mt-1 font-display text-3xl font-bold">{score}/{QUESTIONS.length}</p>
          {answered.length === QUESTIONS.length && (
            <Button variant="outline" className="mt-3 w-full" onClick={onReset}>Start over with a fresh lab</Button>
          )}
        </Card>
      </aside>
    </div>
  );
}
