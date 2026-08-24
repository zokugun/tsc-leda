export type Alias = {
	paths: string[];
	prefix: string;
};

export type Compositor = (path: string, value: string) => string;
