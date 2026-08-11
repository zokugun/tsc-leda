import fse from '@zokugun/fs-extra-plus/path';
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

export async function generateCjsFiles(root: string, config: Config, tsConfigFile: string, dtsFiles: string[]): AsyncDResult {
	const outDir = fse.join(config.outDir, 'cjs');

	const execResult = await exec('npx', ['tsc', '-p', tsConfigFile, '--declaration', 'true', '--outDir', outDir, '--module', 'commonjs', '--moduleResolution', 'node', '--esModuleInterop', 'true'], { cwd: root, stdio: 'inherit' });
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
