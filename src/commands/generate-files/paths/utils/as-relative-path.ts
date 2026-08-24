import type { Alias } from '../../types.js';

import fse from '@zokugun/fs-extra-plus/path';

import { buildRelativePath } from './build-relative-path.js';
import { isMatchingFile } from './is-matching-file.js';

export function asRelativePath(file: string, specifier: string, aliases: Alias[], srcDir: string, outDir: string, newExtname?: string): string | null {
	const absoluteSrcDir = fse.parentPath(fse.resolve(srcDir, file));
	const absoluteOutDir = fse.parentPath(fse.resolve(outDir, file));

	if(specifier.startsWith('./') || specifier.startsWith('../')) {
		const absolute = fse.resolve(srcDir, fse.parentPath(file), specifier);

		if(isMatchingFile(absolute)) {
			return buildRelativePath(absolute, absoluteSrcDir, absoluteOutDir, newExtname);
		}
	}
	else {
		for(const { prefix, paths } of aliases) {
			if(specifier.startsWith(prefix)) {
				for(const path of paths) {
					const absolute = fse.resolve(path, specifier.slice(prefix.length));

					if(isMatchingFile(absolute)) {
						return buildRelativePath(absolute, absoluteSrcDir, absoluteOutDir, newExtname);
					}
				}
			}
		}
	}

	return null;
}
