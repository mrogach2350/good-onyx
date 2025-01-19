const { createLogger, format, transports } = require("winston");
const { label, combine, printf } = format;
const myFormat = printf(({ level, message, label }) => {
  return `[${label}] ${level}: ${message}`;
});

const logger = (defaultConfig) =>
  createLogger({
    format: combine(label({ label: "good-onyx-web" }), myFormat),
    transports: [
      new transports.Console({
        handleExceptions: true,
      }),
    ],
  });

module.exports = {
  logger,
};
