import type { EOLStyle, Indent } from '@zokugun/text-line-utils';

export type Config = {
	entries: Record<string, string>;
	formats: {
		cjs: boolean;
		esm: boolean;
	};
	outDir: string;
	srcDir: string;
	tsModule: {
		cjs: string;
		esm: string;
	};
};

export type Package = {
	data: Record<string, unknown>;
	eol: EOLStyle;
	finalEOL: boolean;
	indent: Indent;
};
