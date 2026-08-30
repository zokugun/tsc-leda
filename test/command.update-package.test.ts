/* eslint-disable no-console */

import process from 'node:process';
import fse from '@zokugun/fs-extra-plus/sync';
import { isRecord, isString } from '@zokugun/is-it-type';
import { stringifyError, xtry } from '@zokugun/xtry';
import { vol } from 'memfs';
import { beforeEach, expect, it } from 'vitest';
import YAML from 'yaml';

import { updatePackage } from './rewires/leda.js';

// const DEBUG = process.env.DEBUG === '1' || process.env.DEBUG === 'true' || process.env.DEBUG === 'on' || process.env.DEBUG === 'vol';
const DEBUG_VOL = process.env.DEBUG === 'vol';
const ROOT = fse.join('.', 'test', 'fixtures', 'update-packages');

beforeEach(async () => { // {{{
	vol.reset();
}); // }}}

const files = fse.walk(ROOT, {
	absolute: true,
	onlyFiles: true,
	collect: true,
	filter: (item) => item.path.endsWith('.yml'),
});

if(files.fails) {
	throw files.error;
}

for(const file of files.value) {
	const name = fse.leafName(file.path, 1);

	const readResult = fse.readFile(file.path, 'utf8');
	if(readResult.fails) {
		throw readResult.error;
	}

	const manifestResult = xtry(() => YAML.parse(readResult.value) as unknown);
	if(manifestResult.fails) {
		console.error(file.path);

		throw manifestResult.error;
	}

	const manifest = manifestResult.value;

	if(!isRecord(manifest)) {
		throw new Error(`The file "${fse.relative(ROOT, file.path)}" isn't an object.`);
	}

	const fromJSON = {};
	const expectedFiles: Record<string, string | { error: string }> = {};

	for(const [key, data] of Object.entries(manifest)) {
		if(key.startsWith('/input/')) {
			fromJSON[key.slice(6)] = data;
		}
		else if(key.startsWith('/output/')) {
			expectedFiles[key.slice(7)] = data as string;
		}
	}

	it(name, async () => {
		vol.fromJSON(fromJSON);

		if(DEBUG_VOL) {
			console.log(vol.toJSON());
		}

		await updatePackage();

		if(DEBUG_VOL) {
			console.log(vol.toJSON());
		}

		for(const [file, data] of Object.entries(expectedFiles)) {
			const action = vol.promises.readFile(file, 'utf8');

			if(isString(data)) {
				const result = await xtry(action, stringifyError);
				expect(result.fails).to.be.false;
				expect(result.value).to.eql(data);
			}
			else {
				await expect(action).rejects.toThrow(`${data.error}, open '${file}'`);
			}
		}
	});
}
