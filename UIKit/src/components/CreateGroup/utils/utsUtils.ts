
export function safeJsonParse<T>(jsonString: string, defaultValue: T): T {
  if (typeof jsonString !== 'string') {
    return jsonString
  }
  let result: T
  try {
    result = JSON.parse(jsonString) as T
  } catch (error) {
    result = defaultValue
  }
  return result
}
