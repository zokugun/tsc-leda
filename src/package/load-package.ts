import path from 'node:path';
import { isNonEmptyRecord } from '@zokugun/is-it-type';
import { err, type Result, stringifyError, type Success, xtryAsync, xtrySync } from '@zokugun/xtry';
import fse from 'fs-extra';

export async function loadPackage(root: string): Promise<Result<Record<string, unknown>, string>> {
	const content = await xtryAsync(fse.readFile(path.join(root, 'package.json'), 'utf8'));
	if(content.fails) {
		return err(`Failed to read package.json: ${stringifyError(content.error)}`);
	}

	const packageJson = xtrySync(() => JSON.parse(content.value) as unknown, stringifyError);
	if(packageJson.fails) {
		return err(`Failed to read package.json: ${stringifyError(packageJson.error)}`);
	}

	if(isNonEmptyRecord(packageJson.value)) {
		return packageJson as Success<Record<string, unknown>>;
	}

	return err('package.json isn\'t a record');
}
