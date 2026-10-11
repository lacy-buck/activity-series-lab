<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Lab chemistry data and rules live in src/lib/lab.ts; UI reads from it so scenarios can change in one place.
- Student progress is stored in browser localStorage (no backend) — the activity is anonymous practice.
- GitHub Pages: `bun run build:gh-pages` (GITHUB_PAGES=true) sets the subpath base, router basepath and prerenders "/" to `.output/public`; normal Lovable builds ignore it. Why: Pages only serves static files under a repo subpath.
