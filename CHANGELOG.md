# Changelog

## v0.4.0 | 2026-04-25
- detect the EOL and indentation style, then use them when updating `package.json`

## v0.3.2 | 2026-04-10
- use locked dependencies
- use GitHub Environment to publish

## v0.3.1 | 2026-03-03
- allow both double or single quotes
- generate ESM even if the package isn't a module
- replace log dependency to support Node.js 18.x

## v0.3.0 | 2026-03-02
- add required arguments for `tsc`
- correctly replace inline imports with single quotes
- make it work on Node.js 18.x

## v0.2.0 | 2026-02-13
- replace inline imports in `.d.js` files

## v0.1.6 | 2026-02-13
- correctly replace all local imports

## v0.1.5 | 2026-02-12
- update dependencies and scripts

## v0.1.4 | 2026-01-15
- `node18` becomes the minimal supported version

## v0.1.3 | 2026-01-15
- changing target of the compilation to `node16`

## v0.1.2 | 2026-01-15
- add `.js` extension to the binary script to it can work on `v16`

## v0.1.1 | 2026-01-14
- correctly replace the dynamic imports in the type files

## v0.1.0 | 2026-01-08
- initial release
