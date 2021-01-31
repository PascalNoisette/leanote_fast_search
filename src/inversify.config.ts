import { SearchNote } from './lib/controller/SearchNote';
import { XformUrlEncoded } from './lib/handler/XformUrlEncoded';
import { Container } from 'inversify';
import { Registrable } from './interface/Registrable';
import { ConfiguredLogger } from './lib/logger/ConfigurableLogger';
import { LoggerInstance, LoggerOptions, transports } from 'winston';
import { Cli } from './interface/Cli';
import { Serve } from './lib/cli/serve';

const container = new Container();
container.bind<Registrable>('Registrable').to(SearchNote);
container.bind<Registrable>('Registrable').to(XformUrlEncoded);

container.bind<Cli>('Cli').to(Serve);

container
  .bind<LoggerInstance>('Logger')
  .to(ConfiguredLogger)
  .inSingletonScope();
container.bind<LoggerOptions>('LoggerOptions').toConstantValue({
  exitOnError: false,
  transports: [new transports.Console()]
});

export default container;
