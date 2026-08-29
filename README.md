[@zokugun/tsc-leda](https://github.com/zokugun/tsc-leda)
========================================================

[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@zokugun/tsc-leda?color=brightgreen)](https://www.npmjs.com/package/@zokugun/tsc-leda)
[![NodeJS Version](https://img.shields.io/badge/node.js-%3E%3D%2018.20-green)](#requirements)
[![Modules](https://img.shields.io/badge/modules-ESM-green)](#requirements)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-f87171?logo=kofi&logoColor=white)](https://ko-fi.com/daiyam)
[![Liberapay](https://img.shields.io/badge/Liberapay-facc15?logo=liberapay&logoColor=black)](https://liberapay.com/daiyam/donate)
[![PayPal](https://img.shields.io/badge/PayPal-5277C3?logo=paypal&logoColor=white)](https://paypal.me/daiyam99)

CLI utility which compile (using `tsc`) and prepare TypeScript projects for dual ESM/CJS distribution.

Features
--------

- Compile TypeScript outputs for ESM and CommonJS (uses the TypeScript compiler `tsc` via `npx tsc`)
- Rename generated JS/TS declaration files for Node-style extensions (`.mjs`, `.cjs`, `.d.mts`, `.d.cts`)
- Update `package.json` exports and types mappings to reflect generated outputs
- Small, focused CLI commands for simple automation

Requirements
------------

- **Node.js**: `v18.20` or higher
- **Modules**: ECMAScript Modules (`ESM`)

Installation
------------

Install locally or run with `npx`:

```bash
npm add -D @zokugun/tsc-leda
# or
npx @zokugun/tsc-leda <command>
```

Quick Start
-----------

Typical workflow:

- Add a configuration file at your project root (`.tscledarc.yml`, `.tscledarc.yaml`, `.tscledarc.json` or `.tscledarc`).
- Run the generator to emit `dist` (or your configured `outDir`).
- Update your `package.json` to export the generated entry points.

Examples:

```bash
# Generate compiled files (ESM/CJS depending on config)
# Note: this runs `npx tsc -p <tsconfig>` under the hood to compile your TypeScript sources.
npx tsc-leda generate-files

# Update package.json exports/types after generation
npx tsc-leda update-package
```

Configuration
-------------

Create one of the supported config files at your repository root. Example `.tscledarc.yml`:

```yaml
srcDir: src
outDir: dist
entry:
   .: src/index.ts
   cli: src/cli.ts
format:
   - cjs
   - esm
```

- `srcDir`: source directory (default `src`)
- `outDir`: output directory (default `dist`)
- `entry`: single entry (string) or a mapping of exports -> source files
- `format`: `cjs`, `esm`, or both

The CLI will look for `.tscledarc.yml`, `.tscledarc.yaml`, `.tscledarc.json` or `.tscledarc` in the current working directory.

Commands
--------

- `generate-files` — compile TypeScript and produce ESM/CJS outputs under the configured `outDir`.
- `update-package` — update `package.json` `exports`, `module`, `main`, and `typesVersions` to reference compiled outputs.

Run command help via `npx tsc-leda --help`.

Directive Comments
------------------

Use directive comments to change selected source lines when generating the CommonJS output.

- `// tsc-leda-comment-next-line-if-commonjs`
- `// tsc-leda-comment-next-2-lines-if-commonjs`
- `// tsc-leda-uncomment-next-line-if-commonjs`
- `// tsc-leda-uncomment-next-5-lines-if-commonjs`
- `// tsc-leda-toggle-next-line-if-commonjs`
- `// tsc-leda-toggle-next-3-lines-if-commonjs`

The numbered forms apply to the specified number of following lines.

A toggle directive uncomment the first block and comments the following block of the same size, which is useful for choosing between CommonJS and ESM alternatives:

```typescript
// tsc-leda-toggle-next-line-if-commonjs
// const MODULE_DIRECTORY = `${__dirname}/`;
const MODULE_DIRECTORY = `${dirname(fileURLToPath(import.meta.url))}/`;
```

The CommonJS output contains the `__dirname` version, while the ESM output contains the `import.meta` version.

Contributions
-------------

Contributions are most welcome. Please:

- Open issues and feature requests under the repository discussions.
- Follow the `CONTRIBUTING.md`.

Donations
---------

Support this project by becoming a financial contributor.

<table>
    <tr>
        <td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_kofi.png" alt="Ko-fi" width="80px" height="80px"></td>
        <td><a href="https://ko-fi.com/daiyam" target="_blank">ko-fi.com/daiyam</a></td>
    </tr>
    <tr>
        <td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_liberapay.png" alt="Liberapay" width="80px" height="80px"></td>
        <td><a href="https://liberapay.com/daiyam/donate" target="_blank">liberapay.com/daiyam/donate</a></td>
    </tr>
    <tr>
        <td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_paypal.png" alt="PayPal" width="80px" height="80px"></td>
        <td><a href="https://paypal.me/daiyam99" target="_blank">paypal.me/daiyam99</a></td>
    </tr>
</table>

License
-------

Copyright &copy; 2026-present Baptiste Augrain

Licensed under the [MIT license](https://opensource.org/licenses/MIT).
