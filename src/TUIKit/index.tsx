export * from './components';
export * from './utils';

export function multiply(a: number, b: number): Promise<number> {
  return Promise.resolve(a * b);
}
