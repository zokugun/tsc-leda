import path from 'node:path';
import fse from 'fs-extra';
import { globby } from 'globby';

export async function renameJS(dirPath: string, newExtname: string, replace: (string) => string): Promise<void> {
	const files = await globby('**/*.js', { cwd: dirPath });

	for(const file of files) {
		const inputFile = path.join(dirPath, file);
		const outputFile = inputFile.replace(/\.js$/, newExtname);

		const content = await fse.readFile(inputFile, 'utf8');
		await fse.writeFile(outputFile, replace(content), 'utf8');

		if(outputFile !== inputFile) {
			await fse.unlink(inputFile);
		}
	}
}
