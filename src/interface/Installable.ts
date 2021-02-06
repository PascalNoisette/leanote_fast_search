export interface Installable {
  createIndex(callback: () => void): void;
}
