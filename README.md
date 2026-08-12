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
```

Application locale identifiers are region-specific. Content directories may use the aliases declared
in `content/locales.json`: `en` maps to `en_UK`, and `es` maps to `es_ES`. A regional variant such as
`es_AR` uses its explicit directory name and coexists with `es`; consumers must register that application
locale before using it. Spanish content under `es` must use Spanish from Spain and must not use voseo.

## Editing a page

Edit the Markdown file in a branch and open a pull request. Keep frontmatter valid, preserve the page
slug across locales, and keep code identifiers and API symbols unchanged when translating prose.

Some developer pages are derived from upstream technical sources. Their frontmatter records the source
repository, path, and commit; update those fields only when the upstream source actually changes.

The web application consumes this repository as a synchronized, versioned content source. Its
`content/repository.json` file also provides the repository identity used by the website's page-edit
links.

## Licensing

Documentation and editorial content are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Source-code examples are licensed under Apache-2.0; see [LICENSE-CODE](LICENSE-CODE). QTSurfer names,
logos, and other trademarks are not covered by these licenses.
