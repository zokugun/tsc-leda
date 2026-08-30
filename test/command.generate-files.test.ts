/* eslint-disable no-console */

import fse from '@zokugun/fs-extra-plus';
import { isRecord, isString } from '@zokugun/is-it-type';
import { stringifyError, xtry } from '@zokugun/xtry';
import { expect, it } from 'vitest';
import YAML from 'yaml';

import { generateFiles } from '#/commands/generate-files/generate-files.js';
import { withTempProject } from './utils/with-temp-project.js';

// const DEBUG = process.env.DEBUG === '1' || process.env.DEBUG === 'true' || process.env.DEBUG === 'on'
const PROJECT_ROOT = fse.resolve(import.meta.dirname, '..');
const FIXTURE_ROOT = fse.join('.', 'test', 'fixtures', 'generate-files');

const files = fse.walkSync(FIXTURE_ROOT, {
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

	const readResult = fse.readFileSync(file.path, 'utf8');
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
		throw new Error(`The file "${fse.relative(FIXTURE_ROOT, file.path)}" isn't an object.`);
	}

	it(name, async () => {
		await withTempProject(async (root) => {
			const expectedFiles: Record<string, string | { error: string }> = {};

			for(const [key, data] of Object.entries(manifest)) {
				if(key.startsWith('/input/')) {
					await fse.outputFileAsync(fse.join(root, key.slice(7)), data as string);
				}
				else if(key.startsWith('/output/')) {
					expectedFiles[key.slice(8)] = data as string;
				}
			}

			await fse.symlinkAsync(fse.join(PROJECT_ROOT, 'node_modules'), fse.join(root, 'node_modules'), 'dir');

			await generateFiles();

			for(const [file, data] of Object.entries(expectedFiles)) {
				const result = await fse.readFileAsync(fse.join(root, file), 'utf8');

				if(isString(data)) {
					expect(result.fails).to.be.false;
					expect(result.value).to.eql(data);
				}
				else {
					expect(result.fails).to.be.true;
					expect(stringifyError(result.error)).to.eql(`${data.error}, open '${fse.join(root, file)}'`);
				}
			}
		});
	});
}
