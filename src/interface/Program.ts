export interface Program {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  action(...args: any[]): void | Promise<void>;
  getDescription(): string;
  getCommand(): string;
}
