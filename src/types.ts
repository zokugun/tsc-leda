import { type EOLStyle, type Indent } from '@zokugun/text-line-utils';

export type Config = {
	entries: Record<string, string>;
	formats: {
		cjs: boolean;
		esm: boolean;
	};
	srcDir: string;
	outDir: string;
};

export type Package = {
	data: Record<string, unknown>;
	eol: EOLStyle;
	finalEOL: boolean;
	indent: Indent;
};
