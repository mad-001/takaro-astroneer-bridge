declare module 'astroneer-rcon-client' {
  export class client {
    constructor(config: { ip: string; port: number; password: string });
    connect(): void;
    disconnect(): void;
    on(event: string, callback: (...args: any[]) => void): void;
    listPlayers(): Promise<any[]>;
    kickPlayer(playerGuid: string): Promise<void>;
  }
}
