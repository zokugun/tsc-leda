import fse from '@zokugun/fs-extra-plus/async';
import { type AsyncDResult, err, OK, stringifyError } from '@zokugun/xtry';
import type { Config } from '../../../types.js';
import { exec } from '../../../utils/exec.js';
import { renameDTS } from '../renames/rename-dts.js';
import { renameJS } from '../renames/rename-js.js';
import { replaceCJS } from '../replaces/js/replace-cjs.js';
import { replaceCTS } from '../replaces/ts/replace-cts.js';
import { copySoloDTS } from './copy-solo-dts.js';

const EMPTY_MODULE = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
`;
const TYPE_REGEX = /"type":\s*"module"/

export async function generateCjsFiles(root: string, config: Config, tsConfigFile: string, dtsFiles: string[]): AsyncDResult {
	const outDir = fse.join(config.outDir, 'cjs');
	const updatePackage = config.tsModule.cjs !== 'commonjs';
	const moduleResolution = config.tsModule.cjs === 'commonjs' ? 'node10' : (config.tsModule.cjs === 'nodenext' ? 'nodenext' : 'node16');

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

			const newPackage = originalPackage.slice(0, match.index) + '"type": "commonjs"' + originalPackage.slice(match.index + match.at(0)!.length);

			const result = await fse.writeFile(file, newPackage, 'utf8');
			if(result.fails) {
				return err(`Failed to write package.json: ${stringifyError(result.error)}`);
			}
		}
	}

	const execResult = await exec('npx', ['tsc', '-p', tsConfigFile, '--declaration', 'true', '--outDir', outDir, '--module', config.tsModule.cjs, '--moduleResolution', moduleResolution, '--esModuleInterop', 'true'], { cwd: root, stdio: 'inherit' });

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

	const jsResult = await renameJS(outDir, '.cjs', replaceCJS);
	if(jsResult.fails) {
		return jsResult;
	}

	const dtsResult = await renameDTS(outDir, '.d.cts', replaceCTS);
	if(dtsResult.fails) {
		return dtsResult;
	}

	const copyResult = await copySoloDTS(dtsFiles, '.d.cts', '.cjs', EMPTY_MODULE, root, outDir, config);
	if(copyResult.fails) {
		return copyResult;
	}

	return OK;
}
