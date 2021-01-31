import { Cli } from './interface/Cli';
import { Command } from 'commander';
import container from './inversify.config';

const command = new Command();
container
  .getAll<Cli>('Cli')
  .forEach((cli: Cli) =>
    command
      .command(cli.getCommand())
      .description(cli.getDescription())
      .action(cli.action)
  );

command.parse(process.argv);
