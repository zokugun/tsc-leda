import type ts from 'typescript';
import type { Config } from '#/types.js';
import type { Alias } from '../types.js';
import type { ModifiedFile } from '../utils/restore-modified-files.js';

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
import { replaceDirectives } from '../utils/replace-directives.js';
import { restoreModifiedFiles } from '../utils/restore-modified-files.js';

const EMPTY_MODULE = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
`;
const TYPE_REGEX = /"type":\s*"module"/;

export async function generateCJSFiles(root: string, config: Config, tsConfigFile: string, dtsFiles: string[], aliases: Alias[], tsConfig: ts.ParsedCommandLine): AsyncDResult {
	const { declaration = false } = tsConfig.options;
	const outDir = config.useFormatDir ? fse.join(config.outDir, 'cjs') : config.outDir;
	const updatePackage = config.tsModule.cjs !== 'commonjs';
	const moduleResolution = MODULE_2_RESOLUTION[config.tsModule.cjs];
	const modifiedFiles: ModifiedFile[] = [];

	const replaceResult = await replaceDirectives(tsConfig.fileNames, 'CJS', modifiedFiles, root);
	if(replaceResult.fails) {
		return replaceResult;
	}

	if(updatePackage) {
		const file = fse.join(root, 'package.json');

		const result = await fse.readFile(file, 'utf8');

		if(result.fails) {
			return err(`Failed to read package.json: ${stringifyError(result.error)}`);
		}

		const match = TYPE_REGEX.exec(result.value);

		if(match) {
			const newPackage = `${result.value.slice(0, match.index)}"type": "commonjs"${result.value.slice(match.index + match.at(0)!.length)}`;

			const writeResult = await fse.writeFile(file, newPackage, 'utf8');

			if(writeResult.fails) {
				const restore = await restoreModifiedFiles(modifiedFiles, root);
				if(restore.fails) {
					return restore;
				}

				return err(`Failed to write package.json: ${stringifyError(writeResult.error)}`);
			}

			modifiedFiles.push({
				content: result.value,
				path: file,
			});
		}
	}

	const execResult = await exec('npx', ['tsc', '-p', tsConfigFile, '--declaration', String(declaration), '--outDir', outDir, '--module', config.tsModule.cjs, '--moduleResolution', moduleResolution, '--esModuleInterop', 'true'], { cwd: root, stdio: 'inherit' });

	const restore = await restoreModifiedFiles(modifiedFiles, root);
	if(restore.fails) {
		return restore;
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
