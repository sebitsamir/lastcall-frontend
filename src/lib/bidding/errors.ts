/**
 * BID ERROR CLASSIFIER
 * Raw backend messages are engineer-speak. The UI must translate them into
 * designed states ("BID TOO LOW", "INSUFFICIENT FUNDS") with a recovery
 * action. One classifier, consumed by the Bid Panel.
 */
import type { AxiosError } from "axios";

export type BidFailure =
    | { kind: "tooLow"; message: string }
    | { kind: "insufficientFunds"; message: string }
    | { kind: "seller"; message: string }
    | { kind: "closed"; message: string }
    | { kind: "unknown"; message: string };

export function classifyBidError(error: unknown): BidFailure {
    // Axios wraps backend payloads in `response.data`; network failures have none.
    const err = error as AxiosError<{ message?: string }>;
    const message =
        err.response?.data?.message ?? err.message ?? "Something went wrong.";
    const m = message.toLowerCase();

    if (/higher than|at least|too low|minimum/.test(m)) return { kind: "tooLow", message };
    if (/insufficient|balance|funds/.test(m)) return { kind: "insufficientFunds", message };
    if (/seller|own auction/.test(m)) return { kind: "seller", message };
    if (/ended|closed|not active|finished/.test(m)) return { kind: "closed", message };

    return { kind: "unknown", message };
}