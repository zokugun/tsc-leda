import type { AsyncDResult } from '@zokugun/xtry';

import { exec } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/path';
import { toLines } from '@zokugun/text-line-utils';
import { err, ok, stringifyError } from '@zokugun/xtry';

export async function findDTSFiles(root: string, tsConfigFile: string): AsyncDResult<string[]> {
	const result = await exec('npx', ['tsc', '-p', tsConfigFile, '--listFilesOnly'], { cwd: root });

	if(result.fails) {
		return err(stringifyError(result.error));
	}

	const modulesPrefix = `node_modules${fse.separator}`;
	const dtsFiles: string[] = [];

	for(const path of toLines(result.value.stdout)) {
		if(!path.startsWith(root)) {
			continue;
		}

		const file = path.slice(Math.max(0, root.length + 1));

		if(file.startsWith(modulesPrefix)) {
			continue;
		}

		if(file.endsWith('.d.ts')) {
			dtsFiles.push(file);
		}
	}

	return ok(dtsFiles);
}
