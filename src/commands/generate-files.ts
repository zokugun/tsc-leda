import path from 'node:path';
import process from 'node:process';
import { err, ok, stringifyError, xtryAsync, type Result } from '@zokugun/xtry';
import { execa } from 'execa';
import fse from 'fs-extra';
import { loadConfig } from '../config/load-config.js';
import { renameDTS } from '../renames/rename-dts.js';
import { renameJS } from '../renames/rename-js.js';
import { replaceCJS } from '../renames/replace-cjs.js';
import { replaceCTS } from '../renames/replace-cts.js';
import { replaceMJS } from '../renames/replace-mjs.js';
import { replaceMTS } from '../renames/replace-mts.js';
import { type Config } from '../types.js';
import * as logger from '../utils/logger.js';

export async function generateFiles(_options: {}): Promise<void> {
	const start = Date.now();
	const root = process.cwd();

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

	const duration = Math.ceil((Date.now() - start) / 1000);

	logger.finish(duration);
}

async function prepareOutput(root: string, config: Config): Promise<void> {
	const outDir = path.join(root, config.outDir);

	return fse.emptyDir(outDir);
}

async function findTsconfigFile(root: string, config: Config): Promise<Result<string, string>> {
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

async function generateCjsFiles(root: string, config: Config, tsconfigFile: string): Promise<void> {
	const outDir = path.join(config.outDir, 'cjs');

	await execa('npx', ['tsc', '-p', tsconfigFile, '--declaration', 'true', '--outDir', outDir, '--module', 'commonjs'], { cwd: root, stdio: 'inherit' });

	await renameJS(outDir, '.cjs', replaceCJS);
	await renameDTS(outDir, '.d.cts', replaceCTS);
}

async function generateEsmFiles(root: string, config: Config, tsconfigFile: string): Promise<void> {
	const outDir = path.join(config.outDir, 'esm');

	await execa('npx', ['tsc', '-p', tsconfigFile, '--declaration', 'true', '--outDir', outDir, '--module', 'node16'], { cwd: root, stdio: 'inherit' });

	await renameJS(outDir, '.mjs', replaceMJS);
	await renameDTS(outDir, '.d.mts', replaceMTS);
}
