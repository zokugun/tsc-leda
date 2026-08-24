import type { Compositor } from '../types.js';

export function compose(...compositors: Compositor[]): Compositor {
	return (path, content) => {
		for(const compositor of compositors) {
			content = compositor(path, content);
		}

		return content;
	};
}
