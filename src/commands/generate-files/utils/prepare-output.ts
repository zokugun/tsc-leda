import type { Config } from '../../../types.js';

import fse, { type FsResult } from '@zokugun/fs-extra-plus/async';
import { OK } from '@zokugun/xtry';

export async function prepareOutput(root: string, config: Config): Promise<FsResult<void>> {
	const outDir = fse.join(root, config.outDir);
	const result = await fse.emptyDir(outDir);
	if(result.fails) {
		return result;
	}

	return OK;
}
