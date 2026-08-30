import type { AsyncDResult } from '@zokugun/xtry';
import type { ModifiedFile } from './restore-modified-files.js';

import fse from '@zokugun/fs-extra-plus/async';
import { err, OK, stringifyError } from '@zokugun/xtry';

import { restoreModifiedFiles } from './restore-modified-files.js';

const COMMENT_REGEX = /^(\s*)\/\/ ?(.*)$/;
const DIRECTIVE_REGEX = /^\s*\/\/\s+tsc-leda-(comment|toggle|uncomment)-next-(?:line|(\d+)-lines)-if-commonjs\s*$/;
const TEST_REGEX = /\/\/\s+tsc-leda-(?:comment|toggle|uncomment)-next-(?:line|\d+-lines)-if-commonjs/;

export async function replaceDirectives(fileNames: string[], format: 'CJS' | 'ESM', modifiedFiles: ModifiedFile[], root: string): AsyncDResult {
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

		if(!TEST_REGEX.test(result.value)) {
			continue;
		}

		const content = replace(result.value, format);

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

	return OK;
}

// function commentLine(line: string): string { // {{{
// 	const match = /^(\s*)(.*)$/.exec(line)!;

// 	return `${match[1]}// ${match[2]}`;
// } // }}}

function replace(content: string, format: 'CJS' | 'ESM'): string { // {{{
	const lines = content.split(/(\r?\n)/);

	if(format === 'CJS') {
		for(let index = 0; index < lines.length; index += 2) {
			const match = DIRECTIVE_REGEX.exec(lines[index]);
			if(!match) {
				continue;
			}

			const [, directive, countValue] = match;
			const count = countValue ? Number(countValue) : 1;

			if(!directive) {
				continue;
			}

			lines[index] = '';

			for(let offset = 1; offset <= count && index + (offset * 2) < lines.length; offset += 1) {
				const targetIndex = index + (offset * 2);

				switch(directive) {
					case 'comment':
						lines[targetIndex] = '';
						break;
					case 'toggle':
						lines[targetIndex] = uncommentLine(lines[targetIndex]);

						if(index + ((count + offset) * 2) < lines.length) {
							lines[index + ((count + offset) * 2)] = '';
						}
						break;
					case 'uncomment':
						lines[targetIndex] = uncommentLine(lines[targetIndex]);
						break;
				}
			}
		}
	}
	else {
		for(let index = 0; index < lines.length; index += 2) {
			const match = DIRECTIVE_REGEX.exec(lines[index]);
			if(!match) {
				continue;
			}

			const [, directive, countValue] = match;
			const count = countValue ? Number(countValue) : 1;

			if(!directive) {
				continue;
			}

			lines[index] = '';

			for(let offset = 1; offset <= count && index + (offset * 2) < lines.length; offset += 1) {
				const targetIndex = index + (offset * 2);

				switch(directive) {
					case 'toggle':
						lines[targetIndex] = '';
						break;
					case 'uncomment':
						lines[targetIndex] = '';
						break;
				}
			}
		}
	}

	return lines.join('');
} // }}}

function uncommentLine(line: string): string { // {{{
	const match = COMMENT_REGEX.exec(line);

	return match ? `${match[1]}${match[2]}` : line;
} // }}}
