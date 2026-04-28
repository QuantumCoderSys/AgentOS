import chalk from "chalk";

export const logger = {
  info: (...args: unknown[]) => console.log(chalk.blue("ℹ"), ...args),
  success: (...args: unknown[]) => console.log(chalk.green("✔"), ...args),
  warn: (...args: unknown[]) => console.warn(chalk.yellow("⚠"), ...args),
  error: (...args: unknown[]) => console.error(chalk.red("✖"), ...args),
  debug: (...args: unknown[]) => {
    if (process.env.DEBUG) console.log(chalk.gray("[debug]"), ...args);
  },
  heading: (text: string) => console.log(chalk.bold.underline(text)),
  json: (obj: unknown) => console.log(JSON.stringify(obj, null, 2)),
  newline: () => console.log(),
};
