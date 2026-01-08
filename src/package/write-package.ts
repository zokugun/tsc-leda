import path from 'node:path';
import { type Result, xtryAsync } from '@zokugun/xtry';
import fse from 'fs-extra';

export async function writePackage(root: string, packageJson: Record<string, unknown>): Promise<Result<void, string>> {
	const content = JSON.stringify(packageJson, null, '\t');

	return xtryAsync(fse.writeFile(path.join(root, 'package.json'), content, 'utf8'));
}
