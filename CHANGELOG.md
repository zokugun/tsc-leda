Changelog
=========

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog][keepachangelog], and this project adheres to [Semantic Versioning][semver].

[v0.9.5] | 2026-11-12
---------------------

### Chore

- use renamed dependency

[v0.9.4] | 2026-11-11
---------------------

### Changed

- use `picomatch` and `@zokugun/picoexec`

[v0.9.3] | 2026-11-07
---------------------

### Fixed

- windows: generate correct paths

[v0.9.2] | 2026-11-05
---------------------

### Changed

- update `@zokugun/xtry` dependency to deduplicate/reduce generated types.

### Fixed

- windows: correctly build relative paths


[v0.9.1] | 2026-10-21
---------------------

### Fixed

- replace aliases defined in extended `tsconfig.json` or in `package.json`

[v0.9.0] | 2026-08-30
---------------------

### Added

- add directive comments
- add unit tests

[v0.8.4] | 2026-08-28
---------------------

### Fixed

- fix requirements in README.md

### Changed

- use self to package for distribution

[v0.8.3] | 2026-08-25
---------------------

### Changed

- use path aliases
- use self to build package

[v0.8.2] | 2026-08-25
---------------------

### Changed

- allow no config file, detect and use default options

[v0.8.1] | 2026-08-25
---------------------

### Fixed

- resolve default format from `package.json`
- use `formatDir` when only needed or required
- update `package.json` with correct `formatDir`

[v0.8.0] | 2026-08-25
---------------------

### Added

- add `useFormatDir` option
- use `declaration` from `tsconfig`

[v0.7.0] | 2026-08-24
---------------------

### Added

- use `module` from `tsconfig`
- support `tsconfig`'s `paths` aliases

[v0.6.0] | 2026-08-12
---------------------

### Added

- add `tsModule` option

[v0.5.1] | 2026-08-11
---------------------

### Fixed

- exclude `.d.ts` files found outside the project

[v0.5.0] | 2026-08-11
---------------------

### Added

- copy solo `.d.ts` files

[v0.4.3] | 2026-06-21
---------------------

### Added

- support newly `allowScripts` property in `package.json`

[v0.4.2] | 2026-05-30
---------------------

### Fixed

- `tsc` errors now terminate the process with fatal exceptions

[v0.4.1] | 2026-05-07
---------------------

### Changed

- don't display spinners in CI

[v0.4.0] | 2026-04-25
---------------------

### Changed

- detect the EOL and indentation style, then use them when updating `package.json`

[v0.3.2] | 2026-04-10
---------------------

### Changed

- use locked dependencies
- use GitHub Environment to publish

[v0.3.1] | 2026-03-03
---------------------

### Fixed

- allow both double or single quotes
- generate ESM even if the package isn't a module
- replace log dependency to support Node.js 18.x

[v0.3.0] | 2026-03-02
---------------------

### Fixed

- correctly replace inline imports with single quotes
- make it work on Node.js 18.x

### Changed

- add required arguments for `tsc`

[v0.2.0] | 2026-02-13
---------------------

### Fixed

- replace inline imports in `.d.js` files

[v0.1.6] | 2026-02-13
---------------------

### Fixed

- correctly replace all local imports

[v0.1.5] | 2026-02-12
---------------------

### Changed

- update dependencies and scripts

[v0.1.4] | 2026-01-15
---------------------

### Changed

- `node18` becomes the minimal supported version

[v0.1.3] | 2026-01-15
---------------------

### Changed

- changing target of the compilation to `node16`

[v0.1.2] | 2026-01-15
---------------------

### Fixed

- add `.js` extension to the binary script to it can work on `v16`

[v0.1.1] | 2026-01-14
---------------------

### Fixed

- correctly replace the dynamic imports in the type files

[v0.1.0] | 2026-01-08
---------------------

### Added

- initial release

[keepachangelog]: https://keepachangelog.com/en/2.0.0/
[semver]: https://semver.org/spec/v2.0.0.html
[unreleased]: https://github.com/zokugun/tsc-leda/compare/v0.9.5...HEAD
[v0.9.5]: https://github.com/zokugun/tsc-leda/releases/tag/v0.9.5
[v0.9.4]: https://github.com/zokugun/tsc-leda/releases/tag/v0.9.4
[v0.9.3]: https://github.com/zokugun/tsc-leda/releases/tag/v0.9.3
[v0.9.2]: https://github.com/zokugun/tsc-leda/releases/tag/v0.9.2
[v0.9.1]: https://github.com/zokugun/tsc-leda/releases/tag/v0.9.1
[v0.9.0]: https://github.com/zokugun/tsc-leda/releases/tag/v0.9.0
[v0.8.4]: https://github.com/zokugun/tsc-leda/releases/tag/v0.8.4
[v0.8.3]: https://github.com/zokugun/tsc-leda/releases/tag/v0.8.3
[v0.8.2]: https://github.com/zokugun/tsc-leda/releases/tag/v0.8.2
[v0.8.1]: https://github.com/zokugun/tsc-leda/releases/tag/v0.8.1
[v0.8.0]: https://github.com/zokugun/tsc-leda/releases/tag/v0.8.0
[v0.7.0]: https://github.com/zokugun/tsc-leda/releases/tag/v0.7.0
[v0.6.0]: https://github.com/zokugun/tsc-leda/releases/tag/v0.6.0
[v0.5.1]: https://github.com/zokugun/tsc-leda/releases/tag/v0.5.1
[v0.5.0]: https://github.com/zokugun/tsc-leda/releases/tag/v0.5.0
[v0.4.3]: https://github.com/zokugun/tsc-leda/releases/tag/v0.4.3
[v0.4.2]: https://github.com/zokugun/tsc-leda/releases/tag/v0.4.2
[v0.4.1]: https://github.com/zokugun/tsc-leda/releases/tag/v0.4.1
[v0.4.0]: https://github.com/zokugun/tsc-leda/releases/tag/v0.4.0
[v0.3.2]: https://github.com/zokugun/tsc-leda/releases/tag/v0.3.2
[v0.3.1]: https://github.com/zokugun/tsc-leda/releases/tag/v0.3.1
[v0.3.0]: https://github.com/zokugun/tsc-leda/releases/tag/v0.3.0
[v0.2.0]: https://github.com/zokugun/tsc-leda/releases/tag/v0.2.0
[v0.1.6]: https://github.com/zokugun/tsc-leda/releases/tag/v0.1.6
[v0.1.5]: https://github.com/zokugun/tsc-leda/releases/tag/v0.1.5
[v0.1.4]: https://github.com/zokugun/tsc-leda/releases/tag/v0.1.4
[v0.1.3]: https://github.com/zokugun/tsc-leda/releases/tag/v0.1.3
[v0.1.2]: https://github.com/zokugun/tsc-leda/releases/tag/v0.1.2
[v0.1.1]: https://github.com/zokugun/tsc-leda/releases/tag/v0.1.1
[v0.1.0]: https://github.com/zokugun/tsc-leda/releases/tag/v0.1.0
