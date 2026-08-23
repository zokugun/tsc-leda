import type { Config } from '../types.js';

import path from 'node:path';
import fse from '@zokugun/fs-extra-plus/async';
import { isArray, isNonBlankString, isRecord } from '@zokugun/is-it-type';
import { err, ok, type Result, stringifyError, xtrySync, yerr, yresSync, type YResult } from '@zokugun/xtry';
import YAML from 'yaml';

const CONFIG_FILES: Array<{ name: string; type?: 'json' | 'yaml' }> = [
	{
		name: '.tscledarc.yml',
		type: 'yaml',
	},
	{
		name: '.tscledarc.yaml',
		type: 'yaml',
	},
	{
		name: '.tscledarc.json',
		type: 'json',
	},
	{
		name: '.tscledarc',
	},
];

export async function loadConfig(fileRoot: string): Promise<Result<Config, string>> { // {{{
	for(const { name, type } of CONFIG_FILES) {
		const filename = path.join(fileRoot, name);
		const result = await tryReadConfigFile(filename, fileRoot, name, type);

		if(result.fails || result.success) {
			return result;
		}
	}

	return err(`Directory ${fileRoot} must include one of ${CONFIG_FILES.map(({ name }) => name).join(', ')} at its root.`);
} // }}}

function normalizeConfig(data: unknown, root: string, source: string): Result<Config, string> { // {{{
	if(!isRecord(data)) {
		return err(`Config file ${source} must export an object.`);
	}

	const sourceDir = isNonBlankString(data.srcDir) ? data.srcDir as string : 'src';
	const outDir = isNonBlankString(data.outDir) ? data.outDir as string : 'dist';
	const entries: Record<string, string> = {};

	if(isRecord(data.entry)) {
		for(const [key, value] of Object.entries(data.entry)) {
			if(isNonBlankString(key) && isNonBlankString(value)) {
				entries[key] = value as string;
			}
		}
	}
	else if(isNonBlankString(data.entry)) {
		entries['.'] = data.entry as string;
	}

	const formats = { cjs: false, esm: false };

	if(isArray(data.format)) {
		for(const format of data.format) {
			if(format === 'cjs') {
				formats.cjs = true;
			}
			else if(format === 'esm') {
				formats.esm = true;
			}
		}
	}
	else {
		if(data.format === 'cjs') {
			formats.cjs = true;
		}
		else if(data.format === 'esm') {
			formats.esm = true;
		}
	}

	const tsModule = { cjs: 'commonjs', esm: 'es2022' };

	if(isRecord(data.tsModule)) {
		let { cjs, esm } = data.tsModule;

		if(isNonBlankString<string>(cjs)) {
			cjs = cjs.trim().toLowerCase();

			if(cjs === 'commonjs' || cjs === 'node16' || cjs === 'node18' || cjs === 'node20' || cjs === 'nodenext') {
				tsModule.cjs = cjs;
			}
		}

		if(isNonBlankString<string>(esm)) {
			esm = esm.trim().toLowerCase();

			if(esm === 'es2015' || esm === 'es2020' || esm === 'es2022' || esm === 'esnext') {
				tsModule.esm = esm;
			}
		}
	}

	return ok({
		entries,
		formats,
		outDir,
		srcDir: sourceDir,
		tsModule,
	});
} // }}}

function parseConfigContent(content: string, type?: 'json' | 'yaml'): Result<unknown, string> { // {{{
	if(type === 'json') {
		return xtrySync(() => JSON.parse(content) as unknown, stringifyError);
	}

	if(type === 'yaml') {
		return xtrySync(() => YAML.parse(content) as unknown, stringifyError);
	}

	let result = xtrySync(() => JSON.parse(content) as unknown, stringifyError);

	if(result.fails) {
		result = xtrySync(() => YAML.parse(content) as unknown, stringifyError);
	}

	return result;
} // }}}

async function tryReadConfigFile(filename: string, root: string, name: string, type?: 'json' | 'yaml'): Promise<YResult<Config, string, 'not-found'>> { // {{{
	const content = await fse.readFile(filename, 'utf8');

	if(content.fails) {
		if(content.error.code === 'ENOENT') {
			return yerr('not-found');
		}

		return err(`Failed to read ${name} from package: ${stringifyError(content.error)}`);
	}

	const parsed = parseConfigContent(content.value, type);

	if(parsed.fails) {
		return err(`Failed to parse ${name} from package: ${parsed.error}`);
	}

	return yresSync(normalizeConfig(parsed.value, root, name));
} // }}}
