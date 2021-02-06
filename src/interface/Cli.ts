export interface Cli {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  action(...args: any[]): void | Promise<void>;
  getDescription(): string;
  getCommand(): string;
}
