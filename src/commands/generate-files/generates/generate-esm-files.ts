import type ts from 'typescript';
import type { Config } from '#/types.js';
import type { Alias } from '../types.js';

import fse from '@zokugun/fs-extra-plus/path';
import { type AsyncDResult, err, OK, stringifyError } from '@zokugun/xtry';

import { exec } from '#utils/exec.js';
import { MODULE_2_RESOLUTION } from '#utils/module.js';
import { copySoloDTS } from '../dts/copy-solo-dts.js';
import { replaceMTS } from '../dts/replace-mts.js';
import { replacePaths } from '../paths/replace-paths.js';
import { renameDTS } from '../renames/rename-dts.js';
import { renameJS } from '../renames/rename-js.js';
import { compose } from '../utils/compose.js';
import { resolveModule } from '../utils/resolve-module.js';

export async function generateESMFiles(root: string, config: Config, tsConfigFile: string, dtsFiles: string[], aliases: Alias[], tsConfig: ts.ParsedCommandLine): AsyncDResult {
	const { declaration = false } = tsConfig.options;
	const outDir = config.useFormatDir ? fse.join(config.outDir, 'esm') : config.outDir;
	const module = config.tsModule.esm ?? resolveModule(tsConfig) ?? 'node16';
	const moduleResolution = MODULE_2_RESOLUTION[module];

	const execResult = await exec('npx', ['tsc', '-p', tsConfigFile, '--declaration', String(declaration), '--outDir', outDir, '--module', module, '--moduleResolution', moduleResolution, '--removeComments'], { cwd: root, stdio: 'inherit' });
	if(execResult.fails) {
		return err(stringifyError(execResult.error));
	}

	const jsResult = await renameJS(outDir, '.mjs', replacePaths(outDir, tsConfigFile, aliases, '.mjs'));
	if(jsResult.fails) {
		return jsResult;
	}

	if(declaration) {
		const dtsResult = await renameDTS(outDir, '.d.mts', compose(replacePaths(outDir, tsConfigFile, aliases), replaceMTS));
		if(dtsResult.fails) {
			return dtsResult;
		}

		const copyResult = await copySoloDTS(dtsFiles, '.d.mts', '.mjs', 'export {};\n', root, outDir, config);
		if(copyResult.fails) {
			return copyResult;
		}
	}

	return OK;
}
