import type { ModuleType } from '../../../utils/module.js';

import ts from 'typescript';

import { MODULES } from '../../../utils/module.js';

export function resolveModule(tsConfig: ts.ParsedCommandLine): ModuleType | undefined {
	if(!tsConfig.options.module) {
		return undefined;
	}

	const module = ts.ModuleKind[tsConfig.options.module].toLowerCase();

	if(MODULES.includes(module as ModuleType)) {
		return module as ModuleType;
	}

	return undefined;
}
