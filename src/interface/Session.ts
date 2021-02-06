export interface Session {
  UserId: string;
  _ID: string;
  isSessionValid(cookies: { [key: string]: string }): Promise<boolean>;
}
