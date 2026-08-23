import type ts from 'typescript';
import type { Config } from '../../../types.js';

import fse from '@zokugun/fs-extra-plus/path';
import { type AsyncDResult, err, OK, stringifyError } from '@zokugun/xtry';

import { copySoloDTS } from './copy-solo-dts.js';
import { resolveModule } from './resolve-module.js';
import { exec } from '../../../utils/exec.js';
import { MODULE_2_RESOLUTION } from '../../../utils/module.js';
import { renameDTS } from '../renames/rename-dts.js';
import { renameJS } from '../renames/rename-js.js';
import { replaceMJS } from '../replaces/js/replace-mjs.js';
import { replaceMTS } from '../replaces/ts/replace-mts.js';

export async function generateEsmFiles(root: string, config: Config, tsConfigFile: string, dtsFiles: string[], tsConfig: ts.ParsedCommandLine): AsyncDResult {
	const outDir = fse.join(config.outDir, 'esm');
	const module = config.tsModule.esm ?? resolveModule(tsConfig) ?? 'node16';
	const moduleResolution = MODULE_2_RESOLUTION[module];

	const execResult = await exec('npx', ['tsc', '-p', tsConfigFile, '--declaration', 'true', '--outDir', outDir, '--module', module, '--moduleResolution', moduleResolution], { cwd: root, stdio: 'inherit' });
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
