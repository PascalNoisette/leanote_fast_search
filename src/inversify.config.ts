import { Container } from 'inversify';
import { LoggerOptions, transports } from 'winston';
import { Autoloader } from 'autoloader-ts';
import glob from 'glob';
import path from 'path';

export const container = new Container();

container.bind<LoggerOptions>('LoggerOptions').toConstantValue({
  exitOnError: false,
  transports: [new transports.Console()]
});
/* Autoload */
export const initialization = Promise.all(
  glob.sync('./src/lib/*').map((dir) =>
    Autoloader.dynamicImport()
      .then((loader) => loader.fromDirectories(path.resolve(dir)))
      .then(async function (loader) {
        for (const exported of loader.getResult().exports) {
          // Get the metadata of the export.
          //const metadata: string = Reflect.getMetadata(JobMetadataKey, exported);
          const capitalized =
            path.basename(dir).charAt(0).toUpperCase() +
            path.basename(dir).slice(1);
          container.bind(capitalized).to(await exported);
        }
      })
  )
);
