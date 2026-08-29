import type { AsyncDResult } from '@zokugun/xtry';

import fse from '@zokugun/fs-extra-plus/async';
import { err, OK, stringifyError } from '@zokugun/xtry';

export type ModifiedFile = {
	content: string;
	path: string;
};

export async function restoreModifiedFiles(files: ModifiedFile[], root: string): AsyncDResult {
	const failures: Array<{ error: NodeJS.ErrnoException; path: string }> = [];

	for(const { content, path } of files) {
		const result = await fse.writeFile(path, content, 'utf8');

		if(result.fails) {
			failures.push({
				error: result.error,
				path,
			});
		}
	}

	if(failures.length === 0) {
		return OK;
	}

	if(failures.length === 1) {
		const [{ error, path }] = failures;

		return err(`Failed to write "${fse.relative(root, path)}": ${stringifyError(error)}`);
	}

	return err(`Failed to write:\n${failures.map(({ error, path }) => `- "${fse.relative(root, path)}": ${stringifyError(error)}`).join('\n')}`);
}
