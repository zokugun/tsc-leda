import { type AsyncResult, xtryify } from '@zokugun/xtry/async';
import { execa, type ExecaError, type Options, type ResultPromise } from 'execa';

export type ExecResult<T = void, E extends ExecaError = ExecaError> = AsyncResult<T, E>;

type ExecaArrayLong<OptionsType extends Options> = <NewOptionsType extends Options>(file: string | URL, args?: readonly string[], options?: NewOptionsType) => ResultPromise<NewOptionsType & OptionsType>;

export const exec = xtryify<ExecaError, ExecaArrayLong<Options>>(execa);
