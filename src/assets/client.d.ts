export default class FayeClient {
  subscribe(endpoint: string, callback: Function): Promise<boolean>;
  setHeader(key: string, value: any): void;
  addExtension(options: Object): void;
}