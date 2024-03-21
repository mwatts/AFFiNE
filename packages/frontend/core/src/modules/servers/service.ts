import {
  getBaseUrl,
  gqlFetcherFactory,
  serverConfigQuery,
  type ServerConfigType,
} from '@affine/graphql';
import { LiveData } from '@toeverything/infra/livedata';
import { Observable } from 'rxjs';

export class Server {
  constructor(
    readonly name: string,
    readonly address: string
  ) {}

  fetcher = gqlFetcherFactory(`${this.address}/graphql`);

  config = LiveData.from(
    new Observable<ServerConfigType>(subscriber => {
      this.fetcher({ query: serverConfigQuery })
        .then(({ serverConfig }) => {
          subscriber.next(serverConfig);
          subscriber.complete();
        })
        .catch(err => subscriber.error(err));
    }),
    null
  );

  get authPolicy() {
    return this.config.map(config => config?.authPolicy);
  }

  get passwordLimits() {
    return this.config.map(config => config?.authPolicy.password);
  }
}

export class ServersService {
  private readonly servers = [new Server('AFFiNE', getBaseUrl())];
  public index = 0;

  get current() {
    return this.servers[this.index];
  }

  select(index: number) {
    this.index = index;
  }
}
