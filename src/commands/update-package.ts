import process from 'node:process';
import logger from '@zokugun/cli-utils/logger';
import { isString } from '@zokugun/is-it-type';
import { stringifyError, xtryAsync } from '@zokugun/xtry';
import { loadConfig } from '../config/load-config.js';
import { loadPackage } from '../package/load-package.js';
import { writePackage } from '../package/write-package.js';
import { type Config } from '../types.js';

export async function updatePackage(): Promise<void> {
	const root = process.cwd();

	logger.beginTimer();

	let done = logger.createStep('Loading configuration');

	const configResult = await loadConfig(root);
	if(configResult.fails) {
		return logger.error(configResult.error);
	}

	const config = configResult.value;
	done();

	done = logger.createStep('Loading package.json');

	const packageResult = await loadPackage(root);
	if(packageResult.fails) {
		return logger.error(packageResult.error);
	}

	const pack = packageResult.value;

	done();

	done = logger.createStep('Preparing new package.json');

	delete pack.data.main;
	delete pack.data.module;
	delete pack.data.typesVersions;
	pack.data.exports = {};

	if(config.formats.esm) {
		await configureEsm(config, pack.data);
	}

	if(config.formats.cjs) {
		await configureCommonJs(config, pack.data);
	}

	done();

	done = logger.createStep('Writing package.json');

	const result = await xtryAsync(writePackage(root, pack));
	if(result.fails) {
		return logger.error(stringifyError(result.error));
	}

	done();

	logger.finishTimer();
}

async function configureCommonJs(config: Config, packageJson: Record<string, unknown>): Promise<void> {
	if(isString(config.entries['.'])) {
		packageJson.main = join(config.outDir, 'cjs', config.entries['.'].replace(/\.ts$/, '.cjs'));
	}

	const exports = packageJson.exports as Record<string, { require?: string }>;
	const typesVersions: Record<string, [string]> = {};

	for(const [key, file] of Object.entries(config.entries)) {
		const entryName = key === '.' ? '.' : join('.', key);

		exports[entryName] ??= {};
		exports[entryName].require = join('.', config.outDir, 'cjs', file.replace(/\.ts$/, '.cjs'));

		typesVersions[key] = [join('.', config.outDir, 'cjs', file.replace(/\.ts$/, '.d.cts'))];
	}

	packageJson.typesVersions = { '*': typesVersions };
}

async function configureEsm(config: Config, packageJson: Record<string, unknown>): Promise<void> {
	if(isString(config.entries['.'])) {
		packageJson.module = join(config.outDir, 'esm', config.entries['.'].replace(/\.ts$/, '.mjs'));
	}

	const exports = packageJson.exports as Record<string, { import?: string }>;

	for(const [key, file] of Object.entries(config.entries)) {
		const entryName = key === '.' ? '.' : join('.', key);

		exports[entryName] ??= {};
		exports[entryName].import = join('.', config.outDir, 'esm', file.replace(/\.ts$/, '.mjs'));
	}
}

function join(...args: string[]): string {
	return args.join('/');
}
