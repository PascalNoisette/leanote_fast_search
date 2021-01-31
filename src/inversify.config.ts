import { SearchNote } from './controller/SearchNote';
import { XformUrlEncoded } from './handler/XformUrlEncoded';
import { Container } from 'inversify';
import { Registrable } from './interface/Registrable';
import { ConfiguredLogger } from './logger/ConfigurableLogger';
import { LoggerInstance, LoggerOptions, transports } from 'winston';

const container = new Container();
container.bind<Registrable>('Registrable').to(SearchNote);
container.bind<Registrable>('Registrable').to(XformUrlEncoded);

container
  .bind<LoggerInstance>('Logger')
  .to(ConfiguredLogger)
  .inSingletonScope();
container.bind<LoggerOptions>('LoggerOptions').toConstantValue({
  exitOnError: false,
  transports: [new transports.Console()]
});

export default container;
