import { isEmptyRecord } from '@zokugun/is-it-type';

type InlineImportMatches = Record<string, InlineImportMatch>;
type InlineImportMatch = {
	variable: string;
	expression: string;
	count: number;
	replace: boolean;
	type: boolean;
};

const INLINE_REGEX = /(?:(:|=>)\s+)?\b(import\(("[^"]*")\)\.(\w+))/g;
const STATEMENT_REGEX = /import (?:type )?{ ([^}]*) } from/g;

export function replaceInlineImports(content: string): string {
	const perVariables: Record<string, InlineImportMatches> = {};
	const perFiles: Record<string, InlineImportMatches> = {};

	let match: RegExpExecArray | null = null;

	while((match = INLINE_REGEX.exec(content))) {
		const [, type, expression, file, variable] = match;

		let replace = true;

		if(perVariables[variable]) {
			replace = false;

			if(perVariables[variable][file]) {
				perVariables[variable][file].count += 1;
			}
			else {
				Object.values(perVariables[variable])[0].replace = replace;

				perVariables[variable][file] = {
					variable,
					expression,
					count: 1,
					replace,
					type: Boolean(type),
				};
			}
		}
		else {
			perVariables[variable] = {
				[file]: {
					variable,
					expression,
					count: 1,
					replace,
					type: Boolean(type),
				},
			};
		}

		if(perFiles[file]) {
			if(perFiles[file][variable]) {
				perFiles[file][variable].count += 1;
			}
			else {
				perFiles[file][variable] = {
					variable,
					expression,
					count: 1,
					replace,
					type: Boolean(type),
				};
			}
		}
		else {
			perFiles[file] = {
				[variable]: {
					variable,
					expression,
					count: 1,
					replace,
					type: Boolean(type),
				},
			};
		}
	}

	if(isEmptyRecord(perFiles)) {
		return content;
	}

	const oldImports: Record<string, boolean> = {};
	while((match = STATEMENT_REGEX.exec(content))) {
		for(let variable of match[1].split(',')) {
			variable = variable.trim();

			if(variable.startsWith('type ')) {
				variable = variable.slice(5);
			}

			const index = variable.indexOf(' as ');
			if(index > 0) {
				variable = variable.slice(Math.max(0, index + 4));
			}

			oldImports[variable] = true;
		}
	}

	const originalContent = content;
	const newImports: string[] = [];

	for(const [file, perFile] of Object.entries(perFiles)) {
		const variables: string[] = [];
		const replacements: InlineImportMatch[] = [];

		for(const [, match] of Object.entries(perFile)) {
			if(!match.replace) {
				continue;
			}

			if(oldImports[match.variable]) {
				const newName = renameVariable(match.variable, oldImports);

				variables.push(`${match.type ? `type ${match.variable}` : match.variable} as ${newName}`);

				match.variable = newName;
			}
			else {
				variables.push(match.type ? `type ${match.variable}` : match.variable);
			}

			replacements.push(match);
		}

		if(variables.length > 0) {
			newImports.push(`import { ${variables.join(', ')} } from ${file.endsWith('/."') ? file.slice(0, -3) + '"' : file};`);

			for(const { expression, variable } of replacements) {
				content = content.replaceAll(expression, variable);
			}
		}
	}

	if(newImports.length > 0) {
		const typeIndex = content.indexOf('declare const _default: {');

		if(typeIndex === -1) {
			const typeIndex = content.indexOf('declare const ');

			if(typeIndex === -1) {
				return originalContent;
			}
		}

		content = content.slice(0, Math.max(0, typeIndex)) + newImports.join('\n') + '\n' + content.slice(Math.max(0, typeIndex));
	}

	return content;
}

function renameVariable(variable: string, oldImport: Record<string, boolean>): string {
	let index = 1;
	let newName = `${variable}${index}`;

	while(oldImport[newName]) {
		index += 1;
		newName = `${variable}${index}`;
	}

	oldImport[newName] = true;

	return newName;
}
