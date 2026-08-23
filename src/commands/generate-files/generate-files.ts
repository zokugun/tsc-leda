import process from 'node:process';
import logger from '@zokugun/cli-utils/logger';
import { stringifyError } from '@zokugun/xtry';

import { findDtsFiles } from './utils/find-dts-files.js';
import { findTsConfigFile } from './utils/find-ts-config-file.js';
import { generateCjsFiles } from './utils/generate-cjs-files.js';
import { generateEsmFiles } from './utils/generate-esm-files.js';
import { prepareOutput } from './utils/prepare-output.js';
import { loadConfig } from '../../config/load-config.js';

export async function generateFiles(): Promise<void> {
	const root = process.cwd();

	logger.beginTimer();

	const done = logger.createStep('Loading configuration');

	const configResult = await loadConfig(root);
	if(configResult.fails) {
		logger.fatal(configResult.error);
	}

	const config = configResult.value;
	done();

	const result = await prepareOutput(root, config);
	if(result.fails) {
		logger.fatal(stringifyError(result.error));
	}

	const tsConfigFile = await findTsConfigFile(root, config);
	if(tsConfigFile.fails) {
		logger.fatal(tsConfigFile.error);
	}

	const dtsFilesResult = await findDtsFiles(root, tsConfigFile.value);
	if(dtsFilesResult.fails) {
		logger.fatal(dtsFilesResult.error);
	}

	if(config.formats.cjs) {
		const done = logger.createStep('Generating CommonJS');

		const result = await generateCjsFiles(root, config, tsConfigFile.value, dtsFilesResult.value);
		if(result.fails) {
			logger.fatal(result.error);
		}

		done();
	}

	if(config.formats.esm) {
		const done = logger.createStep('Generating ESM');

		const result = await generateEsmFiles(root, config, tsConfigFile.value, dtsFilesResult.value);
		if(result.fails) {
			logger.fatal(result.error);
		}

		done();
	}

	logger.finishTimer();
}
