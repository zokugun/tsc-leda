import fse from '@zokugun/fs-extra-plus/sync';

const FILE_EXTENSIONS = [
	'.js',
	'.jsx',
	'.ts',
	'.tsx',
	'.cjs',
	'.mjs',
	'.mdx',
	'.d.ts',
	'.json',
];

export function isMatchingFile(path: string): boolean {
	if(fse.isFile(path)) {
		return true;
	}

	const tsPath = path.replace(/(?<=\.[^/.]*)js$/, '');

	if(fse.isFile(tsPath)) {
		return true;
	}

	const pathWithoutExtension = path.replace(/\.[^/.]*(js|json)$/, '');

	for(const ext of FILE_EXTENSIONS) {
		const path = `${pathWithoutExtension}${ext}`;

		if(fse.isFile(path)) {
			return true;
		}
	}

	return false;
}
