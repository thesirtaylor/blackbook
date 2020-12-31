const winston = require("winston");
const DailyRotate = require("winston-daily-rotate-file");


const fileFormat = winston.format.printf(({ timestamp, label, level, message }) => {
  return `${timestamp} ${label ? `[${label}]` : "-"} [pid ${process.pid}] ${level}: ${message}`;
});
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.errors(),
    winston.format.label(),
    winston.format.prettyPrint(),
    winston.format.splat(),
    winston.format.simple(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    fileFormat
  ),
  // defaultMeta: { service: "user-service" },
  transports: [
    new DailyRotate({
      filename: "./logs/%DATE%/error.log",
      datePattern: "YYYY-MM-DD",
      // zippedArchive: true,
      level: "error",
      // maxFiles: "30d",
      maxSize: "20m",
    }),
    new DailyRotate({
      filename: "./logs/%DATE%/combined.log",
      datePattern: "YYYY-MM-DD",
      // zippedArchive: true,
      level: "info",
      // maxFiles: "30d",
      maxSize: "20m",
    }),
  ],
});

module.exports = logger;