import { Format } from 'logform';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import { format, transports } from 'winston';

export const LoggerFactory = (appName: string) => {
  let consoleFormat: Format;

  consoleFormat = format.combine(
    format.timestamp(),
    format.ms(),
    nestWinstonModuleUtilities.format.nestLike(appName, {
      colors: true,
      prettyPrint: true,
    }),
  );
  return WinstonModule.createLogger({
    level: 'debug',
    transports: [
      new transports.Console({ format: consoleFormat }),
      new transports.File({
        filename: 'src/log/error.log',
        level: 'error',
        format: format.combine(format.timestamp(), format.json()),
      }),
      new transports.File({
        filename: 'src/log/combine.log',
        format: format.combine(format.timestamp(), format.json()),
      }),
    ],
  });
};
