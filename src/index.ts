import { Program } from './interface/Program';
import { Command } from 'commander';
import container from './inversify.config';

const command = new Command();
container
  .getAll<Program>('Program')
  .forEach((program: Program) =>
    command
      .command(program.getCommand())
      .description(program.getDescription())
      .action(program.action)
  );

command.parse(process.argv);
