import path from 'node:path';
import fse from 'fs-extra';
import { globby } from 'globby';

export async function renameDTS(dirPath: string, newExtname: string, replace: (string) => string): Promise<void> {
	const files = await globby('**/*.d.ts', { cwd: dirPath });

	for(const file of files) {
		const inputFile = path.join(dirPath, file);
		const outputFile = inputFile.replace(/\.d\.ts$/, newExtname);

		const content = await fse.readFile(inputFile, 'utf8');
		await fse.writeFile(outputFile, replace(content), 'utf8');

		if(outputFile !== inputFile) {
			await fse.unlink(inputFile);
		}
	}
}
