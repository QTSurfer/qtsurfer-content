# QTSurfer Content

Public documentation and editorial content for QTSurfer.

This repository is the source of truth for the content consumed by the QTSurfer web application. The
web repository synchronizes this tree into its local `content/` directory so builds remain reproducible
and content changes can be reviewed independently through pull requests.

## Content layout

```text
content/locales.json          Content aliases and their default application locales
content/repository.json       GitHub edit-link configuration
content/docs/app/en/          Product documentation in English
content/docs/app/es/          Product documentation in Spanish (Spain)
content/docs/developers/en/   Developer documentation in English
content/docs/developers/es/   Developer documentation in Spanish (Spain)
content/docs/developers/en/api/  Imported QTSurfer API guides, preserving upstream filenames
content/learn/articles/en/    Learn articles in English
content/learn/articles/es/    Complete Learn translations in Spanish (Spain), when available
content/learn/glossary/en/    Curated glossary terms in English
content/learn/glossary/es/    Curated glossary terms in Spanish (Spain)
content/legal/en/             Legal notices in English
content/legal/es/             Legal notices in Spanish (Spain)
static/img/docs/               Static resources referenced by documentation
```

Application locale identifiers are region-specific. Content directories may use the aliases declared
in `content/locales.json`: `en` maps to `en_UK`, and `es` maps to `es_ES`. A regional variant such as
`es_AR` uses its explicit directory name and coexists with `es`; consumers must register that application
locale before using it. Spanish content under `es` must use Spanish from Spain and must not use voseo.

## Editing a page

Edit the Markdown file in a branch and open a pull request. Keep frontmatter valid, preserve the page
slug across locales, and keep code identifiers and API symbols unchanged when translating prose. Learn
articles also preserve their original `datePublished` value. The publishing workflow refreshes each
changed page's `lastUpdated` UTC ISO 8601 timestamp automatically from the commit that changed it; do
not edit that field by hand.

Some developer pages are derived from upstream technical sources. Their frontmatter records the source
repository, path, and commit; update those fields only when the upstream source actually changes.
The English API guides under `content/docs/developers/en/api/` are imported manually from
`QTSurfer/qtsurfer-api/docs/`. Keep their Markdown filenames identical to upstream so future updates
remain directly comparable. Keep their imported graphics under `static/img/docs/` and reference them
with root-relative `/img/docs/...` URLs. The localized API index may exist before its child translations; the
web application exposes the English fallback visibly.

The web application consumes this repository as a synchronized, versioned content source. Its
`content/repository.json` file also provides the repository identity used by the website's page-edit
links.

Glossary entries use a stable `termId` and filename across locales. Their `aliases` are candidate
spellings used for discovery, while their structured `links` contain reviewed internal and external
resources. The web repository can report repeated words and phrases from documentation, but that
report never edits content or links prose automatically.

## Publishing automation

Merging a change to `content/` on `main` sends its immutable commit SHA to the web repository, which
validates, builds, and commits the resulting mirror. Configure the `QTSURFER_WEB_DISPATCH_TOKEN`
repository secret with a fine-grained token that can dispatch to `mrmx/qts-web`; grant it access only to
that repository with `Contents: write`. The workflow deliberately does not dispatch README, license, or
agent-instruction-only changes.

`main` only accepts changes through pull requests. The workflow still commits refreshed `lastUpdated`
timestamps directly to `main`, so it pushes with a dedicated deploy key rather than the default
`GITHUB_TOKEN`: add an `ed25519` deploy key with write access, store its private half in the
`CONTENT_DEPLOY_KEY` repository secret, and list that deploy key in the `main` ruleset's bypass list. The
refresh commit carries `[skip ci]` because a deploy-key push would otherwise trigger the workflow again
and refresh the timestamps in a loop. Timestamp-refresh commits are ignored when computing `lastUpdated`,
so the workflow can also be run manually from the Actions page: that refreshes every document from
history and dispatches the resulting commit, which is the recovery path after a failed run.

## Licensing

Documentation and editorial content are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Source-code examples are licensed under Apache-2.0; see [LICENSE-CODE](LICENSE-CODE). QTSurfer names,
logos, and other trademarks are not covered by these licenses.
