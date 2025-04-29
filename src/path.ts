export function normalizePath(path: string): string {
  return path.replaceAll('\\', '/')
}

export function replacePath(
  source: string,
  search: string,
  replacement: string,
): string {
  return source
    .replaceAll(search, replacement)
    .replaceAll(normalizePath(search), replacement)
}
