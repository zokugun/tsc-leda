export function replaceCJS(content: string): string {
	content = content
		.replaceAll(/require\(("|')(\.\.?\/.*?).js\1\)/g, 'require("$2.cjs")');

	return content;
}
