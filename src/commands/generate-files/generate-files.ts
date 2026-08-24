import process from 'node:process';
import logger from '@zokugun/cli-utils/logger';
import fse from '@zokugun/fs-extra-plus/path';
import { stringifyError } from '@zokugun/xtry';
import ts from 'typescript';

import { findDTSFiles } from './dts/find-dts-files.js';
import { generateCJSFiles } from './generates/generate-cjs-files.js';
import { generateESMFiles } from './generates/generate-esm-files.js';
import { buildAliases } from './paths/build-aliases.js';
import { findTSConfigFile } from './utils/find-ts-config-file.js';
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

	const tsConfigFile = await findTSConfigFile(root, config);
	if(tsConfigFile.fails) {
		logger.fatal(tsConfigFile.error);
	}

	// eslint-disable-next-line ts/unbound-method
	const rawTSConfig = ts.readConfigFile(tsConfigFile.value, ts.sys.readFile);
	if(rawTSConfig.error) {
		logger.fatal(stringifyError(rawTSConfig.error.messageText));
	}

	const parsedTSConfig = ts.parseJsonConfigFileContent(rawTSConfig.config, ts.sys, fse.parentPath(tsConfigFile.value));

	const aliases = buildAliases(tsConfigFile.value, parsedTSConfig);
	if(aliases.fails) {
		logger.fatal(aliases.error);
	}

	const dtsFilesResult = await findDTSFiles(root, tsConfigFile.value);
	if(dtsFilesResult.fails) {
		logger.fatal(dtsFilesResult.error);
	}

	if(config.formats.cjs) {
		const done = logger.createStep('Generating CommonJS');

		const result = await generateCJSFiles(root, config, tsConfigFile.value, dtsFilesResult.value, aliases.value, parsedTSConfig);
		if(result.fails) {
			logger.fatal(result.error);
		}

		done();
	}

	if(config.formats.esm) {
		const done = logger.createStep('Generating ESM');

		const result = await generateESMFiles(root, config, tsConfigFile.value, dtsFilesResult.value, aliases.value, parsedTSConfig);
		if(result.fails) {
			logger.fatal(result.error);
		}

		done();
	}

	logger.finishTimer();
}
