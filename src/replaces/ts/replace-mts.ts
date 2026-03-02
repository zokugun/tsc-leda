import { replaceInlines } from './replace-inlines.js';

export function replaceMTS(content: string): string {
	content = content
		.replaceAll(/from ("|')(\.\.?\/.*?)\.js\1/g, 'from $1$2.mjs$1')
		.replaceAll(/\bimport\(("|')(\.\.?\/.*?)\.js\1\)/g, 'import($1$2.mjs$1)');

	content = replaceInlines(content);

	return content;
}
