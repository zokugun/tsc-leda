import { type AsyncResult, xtryify } from '@zokugun/xtry/async';
import { execa, type ExecaError, type Options, type ResultPromise } from 'execa';

type ExecaArrayLong<OptionsType extends Options> = <NewOptionsType extends Options = {}>(file: string | URL, args?: readonly string[], options?: NewOptionsType) => ResultPromise<OptionsType & NewOptionsType>;

export type ExecResult<T = void, E extends ExecaError = ExecaError> = AsyncResult<T, E>;

export const exec = xtryify<ExecaError, ExecaArrayLong<Options>>(execa);
