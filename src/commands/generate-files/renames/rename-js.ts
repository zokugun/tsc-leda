import type { Compositor } from '../types.js';

import path from 'node:path';
import fse from '@zokugun/fs-extra-plus/async';
import { type AsyncDResult, err, OK, stringifyError } from '@zokugun/xtry';
import { globby } from 'globby';

export async function renameJS(dirPath: string, newExtname: string, replace: Compositor): AsyncDResult {
	const files = await globby('**/*.js', { cwd: dirPath });

	for(const file of files) {
		const inputFile = path.join(dirPath, file);
		const outputFile = inputFile.replace(/\.js$/, newExtname);

		const content = await fse.readFile(inputFile, 'utf8');
		if(content.fails) {
			return err(stringifyError(content.error));
		}

		const patchedContent = replace(file, content.value);

		await fse.writeFile(outputFile, patchedContent, 'utf8');

		if(outputFile !== inputFile) {
			const result = await fse.unlink(inputFile);
			if(result.fails) {
				return err(stringifyError(result.error));
			}
		}
	}

	return OK;
}
