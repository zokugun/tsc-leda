import { Command } from 'commander';
import pkg from '../package.json' with { type: 'json' };
import { generateFiles } from './commands/generate-files.js';
import { updatePackage } from './commands/update-package.js';

const program = new Command();

program
	.version(pkg.version, '-v, --version')
	.description(pkg.description);

program
	.command('update-package')
	.description('update the package.json')
	.action(updatePackage);

program
	.command('generate')
	.description('generate the files')
	.action(generateFiles);

program.parse();
