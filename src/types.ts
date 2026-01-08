export type Config = {
	entries: Record<string, string>;
	formats: {
		cjs: boolean;
		esm: boolean;
	};
	srcDir: string;
	outDir: string;
};
