
import type { Config } from '#/types.js';

import fse from '@zokugun/fs-extra-plus/async';
import { type AsyncDResult, err, OK, stringifyError } from '@zokugun/xtry';

export async function copySoloDTS(dtsFiles: string[], newDtsExtname: string, newTsExtname: string, tsCode: string, root: string, outDir: string, config: Config): AsyncDResult {
	for(const file of dtsFiles) {
		const source = fse.join(root, file);
		const destination = fse.join(root, outDir, file.slice(config.srcDir.length + 1).replace(/\.d\.ts$/, newDtsExtname));

		const dirResult = await fse.ensureDir(fse.parentPath(destination));
		if(dirResult.fails) {
			return err(stringifyError(dirResult.error));
		}

		const copyResult = await fse.copyFile(source, destination);
		if(copyResult.fails) {
			return err(stringifyError(copyResult.error));
		}

		const mjs = destination.replace(newDtsExtname, newTsExtname);

		const writeResult = await fse.outputFile(mjs, tsCode, 'utf8');
		if(writeResult.fails) {
			return err(stringifyError(writeResult.error));
		}
	}

	return OK;
}
