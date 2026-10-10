import { ELEMENTS, SOLUTIONS, type Sym } from "@/lib/lab";
import { cn } from "@/lib/utils";

export type Records = Record<string, "R" | "NR">;
export const key = (m: Sym, i: Sym) => `${m}|${i}`;

export function DataTable({ metals, records, highlight }: { metals: Sym[]; records: Records; highlight?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-mono text-sm">
        <thead>
          <tr>
            <th className="border border-border bg-muted p-2 text-left text-xs font-semibold">Metal ↓ / Solution →</th>
            {SOLUTIONS.map((s) => (
              <th key={s} className="border border-border bg-muted p-2 text-center">{s}Cl₂</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metals.map((m) => (
            <tr key={m}>
              <th className="border border-border bg-muted p-2 text-left">
                {m} <span className="font-sans text-xs font-normal text-muted-foreground">{ELEMENTS[m].name}</span>
              </th>
              {SOLUTIONS.map((s) => {
                const k = key(m, s);
                const v = records[k];
                return (
                  <td
                    key={s}
                    className={cn(
                      "h-10 border border-border text-center text-lg",
                      m === s && "bg-muted/70",
                      highlight === k && "ring-2 ring-inset ring-primary",
                    )}
                  >
                    {m === s ? <span className="text-xs text-muted-foreground">—</span> : v === "R" ? (
                      <span className="font-bold text-success">✓</span>
                    ) : v === "NR" ? (
                      <span className="font-bold text-destructive">✗</span>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted-foreground">✓ = reaction occurred · ✗ = no reaction · — = same metal, not tested</p>
    </div>
  );
}
