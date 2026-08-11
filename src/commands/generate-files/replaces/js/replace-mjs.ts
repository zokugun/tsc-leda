export function replaceMJS(content: string): string {
	content = content
		.replaceAll(/from ("|')(\.\.?\/.*?)\.js\1/g, 'from $1$2.mjs$1')
		.replaceAll(/import\(("|')(\.\.?\/.*?).js\1\)/g, 'import($1$2.mjs$1)');

	return content;
}
