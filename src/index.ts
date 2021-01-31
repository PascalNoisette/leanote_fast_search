import { Cli } from './interface/Cli';
import { Command } from 'commander';
import { initialization, container } from './inversify.config';

initialization.then(function () {
  const command = new Command();
  container
    .getAll<Cli>('Cli')
    .forEach((cli: Cli) =>
      command
        .command(cli.getCommand())
        .description(cli.getDescription())
        .action(cli.action.bind(cli))
    );
  command.parse(process.argv);
});
