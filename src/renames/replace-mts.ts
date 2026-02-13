import { replaceInlineImports } from './replace-inline-imports.js';

export function replaceMTS(content: string): string {
	content = content
		.replaceAll(/from '(\.\.?\/.*?)\.js'/g, 'from \'$1.mjs\'')
		.replaceAll(/\bimport\("(\.\.?\/.*?)\.js"\)/g, 'import("$1.mjs")');

	content = replaceInlineImports(content);

	return content;
}
