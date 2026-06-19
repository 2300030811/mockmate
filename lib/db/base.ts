export function throwIfError<T>(response: { data: T; error: any }): T {
  if (response.error) {
    throw response.error;
  }
  return response.data;
}

export function requireSingle<T>(response: { data: T | null; error: any }): T {
  if (response.error) {
    throw response.error;
  }
  if (!response.data) {
    throw new Error("Row not found");
  }
  return response.data;
}

export function maybeSingle<T>(response: { data: T | null; error: any }): T | null {
  if (response.error) {
    throw response.error;
  }
  return response.data;
}
