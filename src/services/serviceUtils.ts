export type RichError = Error & { payload?: unknown; status?: number };

export function getErrorString(body: unknown): string | undefined {
	if (
		body &&
		typeof body === "object" &&
		"error" in (body as Record<string, unknown>)
	) {
		const e = (body as Record<string, unknown>)["error"];
		if (typeof e === "string") return e;
	}
	if (
		body &&
		typeof body === "object" &&
		"message" in (body as Record<string, unknown>)
	) {
		const m = (body as Record<string, unknown>)["message"];
		if (typeof m === "string") return m;
	}
	return undefined;
}

export function buildResponseError(
	body: unknown,
	fallback: string,
	status?: number
): RichError {
	const msg = getErrorString(body) || fallback;
	const err = new Error(msg) as RichError;
	err.payload = body;
	if (typeof status === "number") err.status = status;
	return err;
}
