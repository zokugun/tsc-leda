import type { AsyncDResult } from '@zokugun/xtry';
import type ts from 'typescript';
import type { Alias } from '../types.js';

import fse from '@zokugun/fs-extra-plus/path';
import { isRecord, isString } from '@zokugun/is-it-type';
import { err, ok } from '@zokugun/xtry';

import { loadPackage } from '#/package/load-package.js';

export async function buildAliases(root: string, config: ts.ParsedCommandLine): AsyncDResult<Alias[]> {
	const aliases: Alias[] = [];

	if(config.options.paths) {
		const pathsBasePath = isString(config.options.pathsBasePath) ? config.options.pathsBasePath : '';

		for(const [alias, paths] of Object.entries(config.options.paths)) {
			if(alias.startsWith('./') || alias.startsWith('../')) {
				return err(`The alias "${alias}" cannot start with a relative path`);
			}

			aliases.push({
				match: toMatcher(alias),
				replaces: paths.map((path) => toReplacer(fse.resolve(root, pathsBasePath, path))),
			});
		}
	}
	else {
		const packageResult = await loadPackage(root);
		if(packageResult.fails) {
			return err(packageResult.error);
		}

		if(isRecord(packageResult.value.data.imports)) {
			for(const [alias, path] of Object.entries(packageResult.value.data.imports)) {
				if(alias.startsWith('./') || alias.startsWith('../')) {
					return err(`The alias "${alias}" cannot start with a relative path`);
				}

				if(isString(path)) {
					aliases.push({
						match: toMatcher(alias),
						replaces: [toReplacer(fse.resolve(root, path))],
					});
				}
			}
		}
	}

	return ok(aliases);
}

function toMatcher(pattern: string): (value: string) => string | null { // {{{
	const index = pattern.indexOf('*');

	if(index === -1) {
		return (value) => (value === pattern ? '' : null);
	}

	const pre = pattern.slice(0, index);
	const post = pattern.slice(index + 1);

	return (value) => {
		if(!value.startsWith(pre) || !value.endsWith(post)) {
			return null;
		}

		return value.slice(pre.length, value.length - post.length);
	};
} // }}}

function toReplacer(pattern: string): (value: string, replacement: string) => string { // {{{
	const index = pattern.indexOf('*');

	if(index === -1) {
		return (value, _replacement) => value;
	}

	const pre = pattern.slice(0, index);
	const post = pattern.slice(index + 1);

	return (_value, replacement) => pre + replacement + post;
} // }}}
