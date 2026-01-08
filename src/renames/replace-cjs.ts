export function replaceCJS(content: string): string {
	return content.replaceAll(/require\("\.\/(.*?).js"\)/g, 'require("./$1.cjs")');
}
