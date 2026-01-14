export function replaceCTS(content: string): string {
	return content
		.replaceAll(/from '\.\/(.*?)\.js'/g, 'from \'./$1.cjs\'')
		.replaceAll(/\bimport\("\.\/(.*?)\.js"\)/g, 'import("./$1.cjs")');
}
