export interface updateUserDto {
	username?: string;
	avatarUrl?: string;
	preferences?: Record<string, unknown>;
	metadata?: Record<string, unknown>;
}
