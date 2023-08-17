/**
 * Config option moved to separate file as it used in test run.
 */
import { Command, Option } from 'commander';

export type ConfigOption = { config?: string };

export const configOption = new Option(
  `-c, --config <file>`,
  `Path to Playwright configuration file (default: playwright.config.(js|ts))`,
);

/**
 * Helper used in test run to detect config location.
 */
export function getCliConfigPath() {
  return new Command()
    .allowUnknownOption()
    .addOption(configOption)
    .parse()
    .getOptionValue('config');
}
