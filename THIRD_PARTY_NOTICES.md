# Sources and third-party notices

Original Paper Reed repository content is licensed under GPL-3.0-only; see [LICENSE](LICENSE). This does not relicense third-party works, dependency packages or trademarks.

## Research sources

- [Mailspring](https://github.com/Foundry376/Mailspring): inspected at `535f13dd463536f36728bce3efb4ae0d51ab3f19`.
- [Mailspring-Sync](https://github.com/Foundry376/Mailspring-Sync): inspected at `8681eae1d217d993e4d4dc7de17ae8b91fc3da49`.
- [Zero](https://github.com/Mail-0/Zero): inspected at `36132735ca3b734b23f48127f9271c80d1ba76e7`.

The downloaded source trees are not included in this repository. [The manifest](research/source-manifest.json) records inspected revisions and file fingerprints, not ownership or a license grant. Consult the upstream notices at the relevant revision before copying code. Selecting this project's license does not select an upstream product foundation.

The isolated research harness uses TypeScript (Apache-2.0) and Zod (MIT); dependency versions and integrity hashes are recorded in [its lockfile](research/harness/package-lock.json). Dependencies are not vendored.

## Visual references

Mimestream, Things and Shortwave were studied as design references; URLs and observations are recorded in [design/REFERENCES.md](design/REFERENCES.md). Downloaded website pages and screenshots are excluded from this repository and are not product assets. The SVGs in `design/review-evidence/` are our prototype structure diagrams, not third-party product screenshots.

Product names and trademarks belong to their respective owners. This independent project has no affiliation with or endorsement from the referenced products or their maintainers.
