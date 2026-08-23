export const MODULES = [
	'commonjs',
	'es2015',
	'es2020',
	'es2022',
	'esnext',
	'node16',
	'node18',
	'node20',
	'nodenext',
] as const;

export const MODULE_RESOLUTIONS = [
	'bundler',
	'node10',
	'node16',
	'nodenext',
] as const;

export type ModuleResolutionType = typeof MODULE_RESOLUTIONS[number];
export type ModuleType = typeof MODULES[number];

export const MODULE_2_RESOLUTION: Record<ModuleType, ModuleResolutionType> = {
	commonjs: 'node10',
	es2015: 'node16',
	es2020: 'node16',
	es2022: 'bundler',
	esnext: 'bundler',
	node16: 'node16',
	node18: 'node16',
	node20: 'node16',
	nodenext: 'nodenext',
};
