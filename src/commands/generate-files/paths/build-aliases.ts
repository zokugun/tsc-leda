import type { DResult } from '@zokugun/xtry';
import type ts from 'typescript';
import type { Alias } from '../types.js';

import fse from '@zokugun/fs-extra-plus/path';
import { err, ok } from '@zokugun/xtry';

export function buildAliases(tsConfigFile: string, config: ts.ParsedCommandLine): DResult<Alias[]> {
	const root = fse.parentPath(tsConfigFile);
	const aliases: Alias[] = [];

	if(config.options.paths) {
		for(const [alias, paths] of Object.entries(config.options.paths)) {
			if(alias.startsWith('./') || alias.startsWith('../')) {
				return err(`The alias "${alias}" cannot start with a relative path`);
			}

			const prefix = alias.replace(/\*$/, '');

			aliases.push({
				prefix,
				paths: paths.map((path) => fse.resolve(root, path.replace(/\*$/, ''))),
			});
		}
	}

	return ok(aliases);
}
