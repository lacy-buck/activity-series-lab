import { ELEMENTS, reacts, solutionName, type Sym } from "@/lib/lab";
import { cn } from "@/lib/utils";

export function Beaker({ metal, ion, running }: { metal: Sym; ion: Sym; running: boolean }) {
  const r = reacts(metal, ion);
  const startColor = ELEMENTS[ion].ionColor;
  const endColor = r ? ELEMENTS[metal].ionColor : startColor;
  return (
    <div className="relative mx-auto h-72 w-40">
      {/* metal strip: held above the beaker, drops in when the test runs */}
      <div
        className={cn(
          "absolute left-1/2 top-0 z-10 h-32 w-5 -translate-x-1/2 overflow-hidden rounded-sm border border-glass bg-muted-foreground/40 transition-transform duration-700 ease-in",
          running ? "translate-y-[120px]" : "translate-y-0",
        )}
      >
        <span className="absolute left-1/2 top-1 -translate-x-1/2 font-mono text-[10px] font-bold text-foreground">{metal}</span>
        {running && r && <div className="coat-grow absolute bottom-0 left-0 w-full bg-ink/80" />}
      </div>
      {/* glass */}
      <div className="absolute bottom-0 h-40 w-full overflow-hidden rounded-b-2xl border-2 border-t-0 border-glass bg-paper/40">
        <div
          className="absolute bottom-0 h-28 w-full transition-colors"
          style={{ backgroundColor: running ? endColor : startColor, transitionDuration: "2.5s", transitionDelay: running ? "0.7s" : "0s" }}
        />
        {running && r &&
          [20, 70, 45, 85, 30].map((x, i) => (
            <span
              key={i}
              className="bubble absolute bottom-2 h-2 w-2 rounded-full border border-glass"
              style={{ left: `${x}%`, animationDelay: `${0.8 + i * 0.3}s` }}
            />
          ))}
        <span className="absolute bottom-1 right-2 font-mono text-xs text-foreground/70">{solutionName(ion)}</span>
      </div>
    </div>
  );
}
