type ActionResult<T = unknown> = {
  ok: boolean;
  message?: string;
  data?: T;
};

export function getActionErrorMessage(
  result: ActionResult,
  fallback: string,
) {
  if (result.ok) return null;
  return result.message || fallback;
}
