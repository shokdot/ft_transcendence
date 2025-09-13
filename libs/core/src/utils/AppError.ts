export class AppError extends Error {
	code: string;

	constructor(code: string) {
		super(code);
		this.code = code;
		this.name = 'AppError';
	}
}
