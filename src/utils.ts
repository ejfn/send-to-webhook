export function escapeJsonValue(value: string | undefined) {
  const o: string[] = [value || ''];
  const str = JSON.stringify(o);
  return str.substring(2, str.length - 2);
}
