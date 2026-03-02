import { replaceInlines } from './replace-inlines.js';

export function replaceCTS(content: string): string {
	content = content
		.replaceAll(/from '(\.\.?\/.*?)\.js'/g, 'from \'$1.cjs\'')
		.replaceAll(/\bimport\("(\.\.?\/.*?)\.js"\)/g, 'import("$1.cjs")');

	content = replaceInlines(content);

	return content;
}
