import path from 'node:path';
import fse from '@zokugun/fs-extra-plus/async';
import { type AsyncDResult, err, OK, stringifyError } from '@zokugun/xtry';
import { globby } from 'globby';

export async function renameDTS(dirPath: string, newExtname: string, replace: (value: string) => string): AsyncDResult {
	const files = await globby('**/*.d.ts', { cwd: dirPath });

	for(const file of files) {
		const inputFile = path.join(dirPath, file);
		const outputFile = inputFile.replace(/\.d\.ts$/, newExtname);

		const content = await fse.readFile(inputFile, 'utf8');
		if(content.fails) {
			return err(stringifyError(content.error));
		}

		await fse.writeFile(outputFile, replace(content.value), 'utf8');

		if(outputFile !== inputFile) {
			const result = await fse.unlink(inputFile);
			if(result.fails) {
				return err(stringifyError(result.error));
			}
		}
	}

	return OK;
}
