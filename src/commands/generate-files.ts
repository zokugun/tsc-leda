import path from 'node:path';
import process from 'node:process';
import logger from '@zokugun/cli-utils/logger';
import fse, { type FsResult } from '@zokugun/fs-extra-plus/async';
import { type AsyncDResult, err, OK, ok, stringifyError, xtryAsync } from '@zokugun/xtry';
import { execa } from 'execa';
import { loadConfig } from '../config/load-config.js';
import { renameDTS } from '../renames/rename-dts.js';
import { renameJS } from '../renames/rename-js.js';
import { replaceCJS } from '../replaces/js/replace-cjs.js';
import { replaceMJS } from '../replaces/js/replace-mjs.js';
import { replaceCTS } from '../replaces/ts/replace-cts.js';
import { replaceMTS } from '../replaces/ts/replace-mts.js';
import { type Config } from '../types.js';

export async function generateFiles(_options: {}): Promise<void> {
	const root = process.cwd();

	logger.begin();

	const done = logger.step('Loading configuration');

	const configResult = await loadConfig(root);
	if(configResult.fails) {
		return logger.error(configResult.error);
	}

	const config = configResult.value;
	done();

	const result = await xtryAsync(prepareOutput(root, config));
	if(result.fails) {
		return logger.error(stringifyError(result.error));
	}

	const tsconfigFile = await findTsconfigFile(root, config);
	if(tsconfigFile.fails) {
		return logger.error(tsconfigFile.error);
	}

	if(config.formats.cjs) {
		const done = logger.step('Generating CommonJS');

		const result = await xtryAsync(generateCjsFiles(root, config, tsconfigFile.value));
		if(result.fails) {
			return logger.error(stringifyError(result.error));
		}

		done();
	}

	if(config.formats.esm) {
		const done = logger.step('Generating ESM');

		const result = await xtryAsync(generateEsmFiles(root, config, tsconfigFile.value));
		if(result.fails) {
			return logger.error(stringifyError(result.error));
		}

		done();
	}

	logger.finish();
}

async function prepareOutput(root: string, config: Config): Promise<FsResult<void>> {
	const outDir = path.join(root, config.outDir);
	const result = await fse.emptyDir(outDir);
	if(result.fails) {
		return result;
	}

	return OK;
}

async function findTsconfigFile(root: string, config: Config): AsyncDResult<string> {
	let sourceDir = path.join(root, config.srcDir);

	do {
		if(await fse.exists(path.join(sourceDir, 'tsconfig.json'))) {
			return ok(path.relative(root, path.join(sourceDir, 'tsconfig.json')));
		}

		sourceDir = path.dirname(sourceDir);
	}
	while(sourceDir.length >= root.length);

	return err('tsconfig.json not found');
}

async function generateCjsFiles(root: string, config: Config, tsconfigFile: string): AsyncDResult {
	const outDir = path.join(config.outDir, 'cjs');

	await execa('npx', ['tsc', '-p', tsconfigFile, '--declaration', 'true', '--outDir', outDir, '--module', 'commonjs', '--moduleResolution', 'node', '--esModuleInterop', 'true'], { cwd: root, stdio: 'inherit' });

	const jsResult = await renameJS(outDir, '.cjs', replaceCJS);
	if(jsResult.fails) {
		return jsResult;
	}

	const dtsResult = await renameDTS(outDir, '.d.cts', replaceCTS);
	if(dtsResult.fails) {
		return dtsResult;
	}

	return OK;
}

async function generateEsmFiles(root: string, config: Config, tsconfigFile: string): AsyncDResult {
	const outDir = path.join(config.outDir, 'esm');

	await execa('npx', ['tsc', '-p', tsconfigFile, '--declaration', 'true', '--outDir', outDir, '--module', 'es2022', '--moduleResolution', 'bundler'], { cwd: root, stdio: 'inherit' });

	const jsResult = await renameJS(outDir, '.mjs', replaceMJS);
	if(jsResult.fails) {
		return jsResult;
	}

	const dtsResult = await renameDTS(outDir, '.d.mts', replaceMTS);
	if(dtsResult.fails) {
		return dtsResult;
	}

	return OK;
}
