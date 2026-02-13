export function replaceMJS(content: string): string {
	return content.replaceAll(/from '(\.\.?\/.*?)\.js'/g, 'from \'$1.mjs\'');
}
