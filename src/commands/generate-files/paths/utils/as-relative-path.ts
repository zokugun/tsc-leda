import type { Alias } from '../../types.js';

import fse from '@zokugun/fs-extra-plus/path';

import { buildRelativePath } from './build-relative-path.js';
import { isMatchingFile } from './is-matching-file.js';

export function asRelativePath(file: string, specifier: string, aliases: Alias[], srcDir: string, outDir: string, newExtname?: string): string | null {
	const absoluteSrcDir = fse.resolve(srcDir);
	const absoluteOutDir = fse.resolve(outDir);
	const absoluteFileSrcDir = fse.join(absoluteSrcDir, fse.parentPath(file));
	const absoluteFileOutDir = fse.join(absoluteOutDir, fse.parentPath(file));

	if(specifier.startsWith('./') || specifier.startsWith('../')) {
		const absolute = fse.resolve(srcDir, fse.parentPath(file), specifier);

		if(isMatchingFile(absolute)) {
			return buildRelativePath(absolute, absoluteFileSrcDir, absoluteFileOutDir, newExtname);
		}
	}
	else {
		for(const { match, replaces } of aliases) {
			const replacement = match(specifier);

			if(replacement !== null) {
				for(const replace of replaces) {
					const absolute = replace(specifier, replacement);

					if(isMatchingFile(absolute)) {
						if(!absolute.startsWith(absoluteSrcDir) || !absolute.endsWith('.ts')) {
							return buildRelativePath(absolute, absoluteFileSrcDir, absoluteFileOutDir, newExtname);
						}

						const absoluteOut = `${absoluteOutDir}${absolute.slice(absoluteSrcDir.length, -3)}${newExtname}`;

						return buildRelativePath(absoluteOut, absoluteFileSrcDir, absoluteFileOutDir, newExtname);
					}
				}
			}
		}
	}

	return null;
}
