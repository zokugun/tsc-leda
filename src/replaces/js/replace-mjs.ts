export function replaceMJS(content: string): string {
	content = content
		.replaceAll(/from '(\.\.?\/.*?)\.js'/g, 'from \'$1.mjs\'')
		.replaceAll(/import\(("|')(\.\.?\/.*?).js\1\)/g, 'import("$2.mjs")');

	return content;
}
