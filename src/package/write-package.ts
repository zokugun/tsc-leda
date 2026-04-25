import path from 'node:path';
import fse from '@zokugun/fs-extra-plus/async';
import { toEOL, toSpaces } from '@zokugun/text-line-utils';
import { err, OK, type Result, stringifyError } from '@zokugun/xtry';
import { type Package } from '../types.js';

export async function writePackage(root: string, pack: Package): Promise<Result<void, string>> {
	const result = await fse.writeJSON(path.join(root, 'package.json'), pack.data, {
		EOL: toEOL(pack.eol),
		finalEOL: pack.finalEOL,
		spaces: toSpaces(pack.indent),
	});

	if(result.fails) {
		return err(stringifyError(result.error));
	}

	return OK;
}
