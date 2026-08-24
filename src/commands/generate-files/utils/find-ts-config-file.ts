import type { Config } from '../../../types.js';

import fse from '@zokugun/fs-extra-plus/async';
import { type AsyncDResult, err, ok } from '@zokugun/xtry';

export async function findTSConfigFile(root: string, config: Config): AsyncDResult<string> {
	let sourceDir = fse.join(root, config.srcDir);

	do {
		if(await fse.exists(fse.join(sourceDir, 'tsconfig.json'))) {
			return ok(fse.relative(root, fse.join(sourceDir, 'tsconfig.json')));
		}

		sourceDir = fse.parentPath(sourceDir);
	}
	while(sourceDir.length >= root.length);

	return err('tsconfig.json not found');
}
