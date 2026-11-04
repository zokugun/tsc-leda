import process from 'node:process';
import fse from '@zokugun/fs-extra-plus/async';

export async function withTempProject(run: (root: string) => Promise<void>): Promise<void> {
	const result = await fse.makeTempDir({
		prefix: 'tsc-leda-',
	});

	if(result.fails) {
		throw result.error;
	}

	const root = result.value;
	const originalCwd = process.cwd();

	console.log(`temp dir: ${root}`)

	try {
		process.chdir(root);

		await run(root);
	}
	catch(error) {
		console.log(error)
	}
	finally {
		process.chdir(originalCwd);

		await fse.remove(root);
	}
}
