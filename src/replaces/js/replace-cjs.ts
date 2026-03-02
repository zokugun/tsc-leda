export function replaceCJS(content: string): string {
	content = content
		.replaceAll(/require\(("|')(\.\.?\/.*?).js\1\)/g, 'require($1$2.cjs$1)');

	return content;
}
