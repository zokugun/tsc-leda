export function replaceMTS(content: string): string {
	return content
		.replaceAll(/from '\.\/(.*?)\.js'/g, 'from \'./$1.mjs\'')
		.replaceAll(/\bimport\("\.\/(.*?)\.js"\)/g, 'import("./$1.mjs")');
}
