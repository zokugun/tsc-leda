import { replaceInlineImports } from './replace-inline-imports.js';

export function replaceCTS(content: string): string {
	content = content
		.replaceAll(/from '(\.\.?\/.*?)\.js'/g, 'from \'$1.cjs\'')
		.replaceAll(/\bimport\("(\.\.?\/.*?)\.js"\)/g, 'import("$1.cjs")');

	content = replaceInlineImports(content);

	return content;
}
