import fse from '@zokugun/fs-extra-plus/path';

export function buildRelativePath(file: string, srcDir: string, outDir: string, newExtname?: string): string {
	const jsFile = file.endsWith('.js');
	const relativeFromDir = jsFile ? srcDir : outDir;
	const maybeRelativePath = fse.join(fse.relative(relativeFromDir, fse.parentPath(file)), fse.leafName(file));
	const relativePath = maybeRelativePath.startsWith('.') ? maybeRelativePath : `./${maybeRelativePath}`;

	if(jsFile && newExtname) {
		return relativePath.slice(0, -3) + newExtname;
	}
	else {
		return relativePath;
	}
}
