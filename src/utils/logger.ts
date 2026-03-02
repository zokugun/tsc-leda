import { stdout } from '@zokugun/log-update-plus';
import c from 'ansi-colors';
import cliSpinners from 'cli-spinners';

export type IndicatorLoading = ReturnType<typeof setInterval>;
const { dots } = cliSpinners;

let $loading: IndicatorLoading | undefined;

export function check(message: string): void {
	stdout.persist(`${c.green(c.symbols.check)} ${message}`);
}

export function error(message: string): void {
	clearInterval($loading);

	stdout.render(`${c.red(c.symbols.cross)} ${c.bold('Error!')}`);

	console.log(message);
}

export function finish(duration: number): void {
	clearInterval($loading);

	stdout.render(`🏁 ${c.bold('Done')} (in ${duration}s).`);
}

export function log(message: string): void {
	stdout.persist(`${c.cyan(c.symbols.bullet)} ${message}`);
}

export function newLine(): void {
	stdout.persist('');
}

export function progress(label: string): void {
	clearInterval($loading);

	let index = 0;

	$loading = setInterval(() => {
		stdout.render(`${c.cyan(dots.frames[index = ++index % dots.frames.length])} ${label}`);
	}, cliSpinners.dots.interval);
}

export function step(label: string): () => void {
	progress(c.bold(label) + c.dim('...'));

	return () => {
		check(c.bold(`${label}:`) + c.dim(' done'));
	};
}

export function warn(message: string): void {
	stdout.persist(`${c.magenta(c.symbols.warning)} ${message}`);
}
