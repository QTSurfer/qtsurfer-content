# AGENTS.md

Instructions for AI agents working in this repository.

All repository documentation, commit messages, and pull-request descriptions must be written in
English. User-facing Markdown under `content/docs/<section>/<content-locale>/` is translated by
definition.

Application locale identifiers are region-specific. Content directories may use only aliases declared
in `content/locales.json` or explicit registered application locales. The `en` alias maps to `en_UK`,
and `es` maps to `es_ES`. A regional locale such as `es_AR` must use its explicit identifier and must not
replace or redefine the `es` default.

English is the source language. Spanish content under `es` must use Spanish from Spain (`es_ES`), with
`tú` forms such as “elige”, “puedes”, and “vuelve”. Never use Rioplatense Spanish or voseo forms such as
“elegí”, “podés”, or “volvé”.

Keep the same slug across translations. Preserve code, identifiers, package names, API symbols, and
source-provenance frontmatter when translating. `scripts/refresh-last-updated.ts` owns each page's
`lastUpdated` ISO 8601 timestamp and the publishing workflow refreshes it automatically from the commit
that changed the Markdown file. A missing translation is preferable to a partial or stale one because
the web application exposes its English fallback visibly.

Pages derived from `QTSurfer/strategy-skills` must retain their exact `upstreamRepository`,
`upstreamCommit`, and `upstreamPath` values. Do not hand-edit generated English pages; update them with
the generator in the web repository and review the resulting diff here.

Documentation prose is licensed under CC BY 4.0. Source-code examples are licensed under Apache-2.0.
Do not add third-party material whose license is incompatible with those terms.
