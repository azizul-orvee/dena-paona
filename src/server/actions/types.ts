export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  /**
   * What the user typed, echoed back so a rejected form re-renders with their
   * input intact. Never carries passwords.
   */
  values?: Record<string, string>;
};

export const idleState: ActionState = { status: "idle" };

/** Pulls the first message per field out of a Zod error. */
export function fieldErrorsFrom(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>;
}) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Collects the named text fields from a submission for echo-back. */
export function valuesFrom(formData: FormData, keys: string[]) {
  const out: Record<string, string> = {};
  for (const key of keys) {
    const v = formData.get(key);
    if (typeof v === "string") out[key] = v;
  }
  return out;
}
