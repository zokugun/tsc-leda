import path from 'node:path';
import fse from '@zokugun/fs-extra-plus/async';
import { isNonEmptyRecord } from '@zokugun/is-it-type';
import { detectEOL, detectIndent, hasFinalEOL } from '@zokugun/text-line-utils';
import { type AsyncDResult, err, ok, parseJSON, stringifyError } from '@zokugun/xtry';
import { type Package } from '../types.js';

export async function loadPackage(root: string): AsyncDResult<Package> {
	const file = path.join(root, 'package.json');

	const result = await fse.readFile(file, 'utf8');
	if(result.fails) {
		return err(`Failed to read package.json: ${stringifyError(result.error)}`);
	}

	const content = fse.utils.stripBom(result.value);
	const data = parseJSON(content);

	if(data.fails) {
		const { error } = data;
		error.message = `${String(file)}: ${error.message}`;

		return err(`Failed to read package.json: ${stringifyError(error)}`);
	}

	if(isNonEmptyRecord(data.value)) {
		return ok({
			data: data.value,
			eol: detectEOL(content),
			finalEOL: hasFinalEOL(content),
			indent: detectIndent(content),
		});
	}

	return err('package.json isn\'t a record');
}
