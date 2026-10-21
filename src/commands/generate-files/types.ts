export type Alias = {
	match: (value: string) => string | null;
	replaces: Array<(value: string, replacement: string) => string>;
};

export type Compositor = (path: string, value: string) => string;
