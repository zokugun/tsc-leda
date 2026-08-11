import fse from '@zokugun/fs-extra-plus/path';
import { type AsyncDResult, err, ok, stringifyError } from '@zokugun/xtry';
import { exec } from '../../../utils/exec.js';

export async function findDtsFiles(root: string, tsConfigFile: string): AsyncDResult<string[]> {
	const execResult = await exec('npx', ['tsc', '-p', tsConfigFile, '--listFilesOnly'], { cwd: root, lines: true });
	if(execResult.fails) {
		return err(stringifyError(execResult.error));
	}

	const { stdout } = execResult.value as { stdout: string[] };
	const modulesPrefix = `node_modules${fse.separator}`;
	const dtsFiles: string[] = [];

	for(const path of stdout) {
		if(!path.startsWith(root)) {
			continue
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
