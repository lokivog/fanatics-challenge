"use strict";
import winston, { Logger, format } from 'winston';
const { combine, colorize, label, timestamp, printf } = format;

const loggerFormat = format.combine(
    colorize({ all: true }),
    label({ label: '[LOGGER]' }),
    timestamp({ format: 'YY-MM-DD HH:MM:SS' }),
    printf(
        (info) =>
            ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
    )
);

export function createDefaultLogger(): Logger {
    return winston.createLogger({
        level: 'info',
        format: combine(
            format.splat(),
            format.json()
        ),
        transports: [new winston.transports.Console({ format: combine(loggerFormat) })]
    })
}