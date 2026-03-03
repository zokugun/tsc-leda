import path from 'node:path';
import fse from '@zokugun/fs-extra-plus/async';
import { err, OK, type Result, stringifyError } from '@zokugun/xtry';

export async function writePackage(root: string, packageJson: Record<string, unknown>): Promise<Result<void, string>> {
	const content = JSON.stringify(packageJson, null, '\t');

	const result = await fse.writeJSON(path.join(root, 'package.json'), content);
	if(result.fails) {
		return err(stringifyError(result.error));
	}

	return OK;
}
