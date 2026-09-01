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

Pages derived from `QTSurfer/strategy-skills` must retain their exact `upstreamRepository`,
`upstreamCommit`, and `upstreamPath` values. Do not hand-edit generated English pages; update them with
the generator in the web repository and review the resulting diff here.

English API guides under `content/docs/developers/en/api/` are manually imported from
`QTSurfer/qtsurfer-api/docs/`. Preserve each upstream Markdown filename exactly and retain its exact
`upstreamRepository`, `upstreamCommit`, and `upstreamPath` frontmatter. When refreshing them, keep body
changes limited to the frontmatter and link adaptations required by MDsveX and the website routes, so
the files remain straightforward to compare with upstream. Copy referenced graphics to
`static/img/docs/` while preserving their upstream filenames, and adapt their Markdown URLs to
root-relative `/img/docs/...`.
Do not invent partial Spanish translations; the visible English fallback is preferred until a complete
`es_ES` translation is available.

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
