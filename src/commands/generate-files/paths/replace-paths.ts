import type { Alias, Compositor } from '../types.js';

import fse from '@zokugun/fs-extra-plus/path';

import { asRelativePath } from './utils/as-relative-path.js';

const MATCHERS = [
	// require('package'), require.resolve('package'), import('package')
	/((?:require|require\.resolve|import)\(")([^"]+)("\))/g,
	/((?:require|require\.resolve|import)\(')([^']+)('\))/g,
	// import 'package'
	/((?:import|export) ")([^"]+)(")/g,
	/((?:import|export) ')([^']+)(')/g,
	// import {} from 'package', import * as name from 'package'
	/((?:import|export) .+ from ")([^"]+)(")/g,
	/((?:import|export) .+ from ')([^']+)(')/g,
	// multiline import/exports with {}
	/((?:import|export) {\n[^}]+} from ")([^"]+)(")/g,
	/((?:import|export) {\n[^}]+} from ')([^']+)(')/g,
];

export function replacePaths(outDir: string, tsConfigFile: string, aliases: Alias[], newExtname?: string): Compositor {
	const scrDir = fse.parentPath(tsConfigFile);

	return (file, content) => {
		for(const matcher of MATCHERS) {
			content = content.replaceAll(matcher, (statement, opening: string, specifier: string, closing: string) => {
				const resolvedPath = asRelativePath(file, specifier, aliases, scrDir, outDir, newExtname);

				if(!resolvedPath) {
					return statement;
				}

				return opening + resolvedPath + closing;
			});
		}

		return content;
	};
}

