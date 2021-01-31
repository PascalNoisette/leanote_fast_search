import { SearchNote } from './controller/SearchNote';
import { XformUrlEncoded } from './handler/XformUrlEncoded';
import { Container } from 'inversify';
import { Registrable } from './interface/Registrable';
import { ConfiguredLogger } from './logger/ConfigurableLogger';
import { LoggerInstance, LoggerOptions, transports } from 'winston';
import { Program } from './interface/Program';
import { Serve } from './command/serve';

const container = new Container();
container.bind<Registrable>('Registrable').to(SearchNote);
container.bind<Registrable>('Registrable').to(XformUrlEncoded);

container.bind<Program>('Program').to(Serve);

container
  .bind<LoggerInstance>('Logger')
  .to(ConfiguredLogger)
  .inSingletonScope();
container.bind<LoggerOptions>('LoggerOptions').toConstantValue({
  exitOnError: false,
  transports: [new transports.Console()]
});

export default container;
