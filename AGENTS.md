# AGENTS.md

Instructions for AI agents working in this repository.

All repository documentation, commit messages, and pull-request descriptions must be written in
English. User-facing Markdown under `content/docs/<section>/<content-locale>/`,
`content/learn/<section>/<content-locale>/`, and
`content/legal/<content-locale>/` is translated by definition.

Application locale identifiers are region-specific. Content directories may use only aliases declared
in `content/locales.json` or explicit registered application locales. The `en` alias maps to `en_UK`,
and `es` maps to `es_ES`. A regional locale such as `es_AR` must use its explicit identifier and must not
replace or redefine the `es` default.

English is the source language. Spanish content under `es` must use Spanish from Spain (`es_ES`), with
`tú` forms such as “elige”, “puedes”, and “vuelve”. Never use Rioplatense Spanish or voseo forms such as
“elegí”, “podés”, or “volvé”.

Keep the same slug across translations. Preserve code, identifiers, package names, API symbols, and
source-provenance frontmatter when translating. `scripts/refresh-last-updated.ts` owns each page's
`lastUpdated` UTC ISO 8601 timestamp and the publishing workflow refreshes it automatically from the
commit that changed the Markdown file. A missing translation is preferable to a partial or stale one
because the web application exposes its English fallback visibly.

Pages derived from `QTSurfer/strategy-skills` live in the Strategies section, under
`content/docs/strategies/<content-locale>/` (`java/` and `qtscript/`), and must retain their exact
`upstreamRepository`, `upstreamCommit`, and `upstreamPath` values. Do not hand-edit generated English
pages; update them with the generator in the web repository and review the resulting diff here.

English API guides under `content/docs/developers/en/api/` are manually imported from
`QTSurfer/qtsurfer-api/docs/`. Preserve each upstream Markdown filename exactly and retain its exact
`upstreamRepository`, `upstreamCommit`, and `upstreamPath` frontmatter. When refreshing them, keep body
changes limited to the frontmatter and link adaptations required by MDsveX and the website routes, so
the files remain straightforward to compare with upstream. Two of those guides belong to the Strategies
section and live under `content/docs/strategies/en/`: `java/strategy_coding.md` keeps the upstream filename,
and `qtscript/index.md` is `docs/qtscript.md` stored as the landing page of its folder (its `upstreamPath`
records the upstream file). Their links to the guides that stayed in `developers/en/api/` are absolute site
paths, since a relative name would no longer resolve; the guides that stayed link to those two with absolute
paths as well. The home of the Strategies section, `content/docs/strategies/<locale>/index.md`, is written in
this repository and has no upstream: it carries no `upstream*` fields, takes the lowest `order`, is translated
like any editorial page and declares an explicit `id` (the same in every language), because its slug is empty
and the site derives the `id` of the other pages from the slug. Copy referenced graphics to
`static/img/docs/` while preserving their upstream filenames, and adapt their Markdown URLs to
root-relative `/img/docs/...`.
Do not invent partial Spanish translations; the visible English fallback is preferred until a complete
`es_ES` translation is available.

The Indicators section lives under `content/docs/indicators/<content-locale>/`: one folder per indicator group, named as
the catalogues name it in lower case (`oscillators/`), and one page per indicator inside it, named by the indicator's
builder name (`rsi.md`). The section home, `index.md`, and the `index.md` of every group are written in this repository,
have no upstream, take the lowest `order` of their level and are translated like any editorial page. The home declares an
explicit `id` (the same in every language), as the home of Strategies does, because its slug is empty. A group needs its
`index.md`: the site lists a page in the sidebar only under an existing parent page. These pages say what the engine
computes, so check a claim against the engine's own behaviour before publishing it.

A page can show an interactive chart: put a plain element on its own line where the chart goes, and the site mounts the
chart into it. There are two kinds. `<div data-indicator-chart="sma"></div>` is the generic chart of one indicator, named
as the catalogues name it, and `any` adds a picker over all of them; it draws what the engine computes and reads nothing
into it. `<div data-indicator-demo="rsi"></div>` is an interpretation demo written for one indicator (`rsi`,
`ema-crossover`), which adds how it is read, with levels and arrows, and exists only where that reading is clear. A name
the site does not know leaves the element empty, so a page may name a chart before the site has it. Keep the element
identical in every language.

Learn articles live under `content/learn/articles/<content-locale>/`. English is the editorial source of truth;
publish a missing translation as a visible English fallback rather than creating a partial or thin
localized page. Every standalone concept page must answer a real reader question with substantive,
QTSurfer-relevant material. Preserve `datePublished`; the publishing workflow owns `lastUpdated`.

Glossary entries live under `content/learn/glossary/<content-locale>/`. Keep `termId` and the filename stable
across translations, list deliberate spelling or acronym variants in `aliases`, and keep related links
in the structured `links` frontmatter. Entries are curated: repeated terms discovered by tooling are
candidates only and must never create or link glossary entries automatically.

Documentation prose is licensed under CC BY 4.0. Source-code examples are licensed under Apache-2.0.
Do not add third-party material whose license is incompatible with those terms.
