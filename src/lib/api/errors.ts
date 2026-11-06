/**
 * Pull a human-readable message out of an Axios/API failure.
 * Backend AppErrors land on `response.data.message`; network failures have none.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
    const err = error as {
        message?: string;
        code?: string;
        response?: { status?: number; data?: { message?: string } };
    };

    const serverMessage = err.response?.data?.message?.trim();
    if (serverMessage) {
        return serverMessage.replace(/^Validation failed:\s*/i, "");
    }

    if (!err.response) {
        return "Couldn't reach the server. Check your connection and try again.";
    }

    return fallback;
}
