import fse from '@zokugun/fs-extra-plus/path';
import { type AsyncDResult, err, OK, stringifyError } from '@zokugun/xtry';
import type { Config } from '../../../types.js';
import { exec } from '../../../utils/exec.js';
import { renameDTS } from '../renames/rename-dts.js';
import { renameJS } from '../renames/rename-js.js';
import { replaceMJS } from '../replaces/js/replace-mjs.js';
import { replaceMTS } from '../replaces/ts/replace-mts.js';
import { copySoloDTS } from './copy-solo-dts.js';

export async function generateEsmFiles(root: string, config: Config, tsConfigFile: string, dtsFiles: string[]): AsyncDResult {
	const outDir = fse.join(config.outDir, 'esm');

	const execResult = await exec('npx', ['tsc', '-p', tsConfigFile, '--declaration', 'true', '--outDir', outDir, '--module', config.tsModule.esm, '--moduleResolution', 'bundler'], { cwd: root, stdio: 'inherit' });
	if(execResult.fails) {
		return err(stringifyError(execResult.error));
	}

	const jsResult = await renameJS(outDir, '.mjs', replaceMJS);
	if(jsResult.fails) {
		return jsResult;
	}

	const dtsResult = await renameDTS(outDir, '.d.mts', replaceMTS);
	if(dtsResult.fails) {
		return dtsResult;
	}

	const copyResult = await copySoloDTS(dtsFiles, '.d.mts', '.mjs', 'export {};\n', root, outDir, config);
	if(copyResult.fails) {
		return copyResult;
	}

	return OK;
}
