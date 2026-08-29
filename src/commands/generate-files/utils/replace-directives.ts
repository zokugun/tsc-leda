import type { AsyncDResult } from '@zokugun/xtry';
import type { ModifiedFile } from './restore-modified-files.js';

import fse from '@zokugun/fs-extra-plus/async';
import { err, ok, stringifyError } from '@zokugun/xtry';

import { restoreModifiedFiles } from './restore-modified-files.js';

const COMMENT_REGEX = /^(\s*)\/\/ ?(.*)$/;
const DIRECTIVE_REGEX = /^(\s*)\/\/\s+tsc-leda-(comment|uncomment|toggle)-next-(line|(\d+)-lines)-if-commonjs\s*$/;
const TEST_REGEX = /\/\/\s+tsc-leda-(?:comment|uncomment|toggle)-next-(?:line|(\d+)-lines)-if-commonjs/;

export async function replaceDirectives(fileNames: string[], root: string): AsyncDResult<ModifiedFile[]> {
	const modifiedFiles: ModifiedFile[] = [];

	for(const fileName of fileNames) {
		if(/\.d\.tsx?$/.test(fileName) || !/\.tsx?$/.test(fileName)) {
			continue;
		}

		const result = await fse.readFile(fileName, 'utf8');
		if(result.fails) {
			const restore = await restoreModifiedFiles(modifiedFiles, root);

			if(restore.fails) {
				return restore;
			}

			return err(`Failed to read ${fileName}: ${stringifyError(result.error)}`);
		}

		if(!TEST_REGEX.exec(result.value)) {
			continue;
		}

		const content = replace(result.value);

		if(content !== result.value) {
			const writeResult = await fse.writeFile(fileName, content, 'utf8');

			if(writeResult.fails) {
				const restore = await restoreModifiedFiles(modifiedFiles, root);

				if(restore.fails) {
					return restore;
				}

				return err(`Failed to write ${fileName}: ${stringifyError(writeResult.error)}`);
			}

			modifiedFiles.push({
				content: result.value,
				path: fileName,
			});
		}
	}

	return ok(modifiedFiles);
}

function commentLine(line: string): string { // {{{
	const match = /^(\s*)(.*)$/.exec(line)!;

	return `${match[1]}// ${match[2]}`;
} // }}}

function replace(content: string): string { // {{{
	const lines = content.split(/(\r?\n)/);

	for(let index = 0; index < lines.length; index += 2) {
		const match = DIRECTIVE_REGEX.exec(lines[index]);
		if(!match) {
			continue;
		}

		const [, , directive, , countValue] = match;
		const count = countValue ? Number(countValue) : 1;

		if(!directive) {
			continue;
		}

		for(let offset = 1; offset <= count && index + (offset * 2) < lines.length; offset += 1) {
			const targetIndex = index + (offset * 2);

			switch(directive) {
				case 'comment':
					lines[targetIndex] = commentLine(lines[targetIndex]);
					break;
				case 'toggle':
					lines[targetIndex] = uncommentLine(lines[targetIndex]);
					if(index + ((count + offset) * 2) < lines.length) {
						lines[index + ((count + offset) * 2)] = commentLine(lines[index + ((count + offset) * 2)]);
					}
					break;
				case 'uncomment':
					lines[targetIndex] = uncommentLine(lines[targetIndex]);
					break;
			}
		}
	}

	return lines.join('');
} // }}}

function uncommentLine(line: string): string { // {{{
	const match = COMMENT_REGEX.exec(line);

	return match ? `${match[1]}${match[2]}` : line;
} // }}}
