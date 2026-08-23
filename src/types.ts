import type { EOLStyle, Indent } from '@zokugun/text-line-utils';
import type { ModuleType } from './utils/module.js';

export type Config = {
	entries: Record<string, string>;
	formats: {
		cjs: boolean;
		esm: boolean;
	};
	outDir: string;
	srcDir: string;
	tsModule: {
		cjs: ModuleType;
		esm?: ModuleType;
	};
};

export type Package = {
	data: Record<string, unknown>;
	eol: EOLStyle;
	finalEOL: boolean;
	indent: Indent;
};
