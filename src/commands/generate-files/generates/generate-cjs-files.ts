import type ts from 'typescript';
import type { Config } from '#/types.js';
import type { Alias } from '../types.js';

import fse from '@zokugun/fs-extra-plus/async';
import { type AsyncDResult, err, OK, stringifyError } from '@zokugun/xtry';

import { exec } from '#utils/exec.js';
import { MODULE_2_RESOLUTION } from '#utils/module.js';
import { copySoloDTS } from '../dts/copy-solo-dts.js';
import { replaceCTS } from '../dts/replace-cts.js';
import { replacePaths } from '../paths/replace-paths.js';
import { renameDTS } from '../renames/rename-dts.js';
import { renameJS } from '../renames/rename-js.js';
import { compose } from '../utils/compose.js';

const EMPTY_MODULE = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
`;
const TYPE_REGEX = /"type":\s*"module"/;

export async function generateCJSFiles(root: string, config: Config, tsConfigFile: string, dtsFiles: string[], aliases: Alias[], tsConfig: ts.ParsedCommandLine): AsyncDResult {
	const { declaration = false } = tsConfig.options;
	const outDir = config.useFormatDir ? fse.join(config.outDir, 'cjs') : config.outDir;
	const updatePackage = config.tsModule.cjs !== 'commonjs';
	const moduleResolution = MODULE_2_RESOLUTION[config.tsModule.cjs];

	let originalPackage: string | undefined;
	let restorePackage = false;

	if(updatePackage) {
		const file = fse.join(root, 'package.json');

		const result = await fse.readFile(file, 'utf8');
		if(result.fails) {
			return err(`Failed to read package.json: ${stringifyError(result.error)}`);
		}

		originalPackage = result.value;

		const match = TYPE_REGEX.exec(originalPackage);

		if(match) {
			restorePackage = true;

			const newPackage = `${originalPackage.slice(0, match.index)}"type": "commonjs"${originalPackage.slice(match.index + match.at(0)!.length)}`;

			const result = await fse.writeFile(file, newPackage, 'utf8');
			if(result.fails) {
				return err(`Failed to write package.json: ${stringifyError(result.error)}`);
			}
		}
	}

	const execResult = await exec('npx', ['tsc', '-p', tsConfigFile, '--declaration', String(declaration), '--outDir', outDir, '--module', config.tsModule.cjs, '--moduleResolution', moduleResolution, '--esModuleInterop', 'true'], { cwd: root, stdio: 'inherit' });

	if(restorePackage) {
		const file = fse.join(root, 'package.json');
		const result = await fse.writeFile(file, originalPackage!, 'utf8');

		if(result.fails) {
			return err(`Failed to write package.json: ${stringifyError(result.error)}`);
		}
	}

	if(execResult.fails) {
		return err(stringifyError(execResult.error));
	}

	const jsResult = await renameJS(outDir, '.cjs', replacePaths(outDir, tsConfigFile, aliases, '.cjs'));
	if(jsResult.fails) {
		return jsResult;
	}

	if(declaration) {
		const dtsResult = await renameDTS(outDir, '.d.cts', compose(replacePaths(outDir, tsConfigFile, aliases), replaceCTS));
		if(dtsResult.fails) {
			return dtsResult;
		}

		const copyResult = await copySoloDTS(dtsFiles, '.d.cts', '.cjs', EMPTY_MODULE, root, outDir, config);
		if(copyResult.fails) {
			return copyResult;
		}
	}

	return OK;
}
