#!/usr/bin/env ts-node

import axios from 'axios';
import { program } from 'commander';
import { createLogger, format, transports } from 'winston';
import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';


interface Config {
  urls: Array<{ url: string; interval: number }>;
  defaultInterval: number;
}

interface PingResult {
  url: string;
  status: string;
  statusCode?: number;
  responseTime?: number;
  error?: string;
  timestamp: string;
}


// Logger setup
const logger = createLogger({
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ssZ' }),
      format.printf(({ timestamp, level, message }) => `${timestamp} ${level.toUpperCase()} ${message}`)
    ),
    transports: [
      // Console transport with colors
      new transports.Console({
        format: format.combine(
          format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ssZ' }),
          format.printf((info) => {
            const { timestamp, level, message } = info as { timestamp: string; level: string; message: string };
            const coloredTimestamp = chalk.yellow(timestamp);
            const coloredLevel = chalk.blue(level.toUpperCase());
            let coloredMessage = message;
  
            // Colorize ping logs
            if (message.includes('SUCCESS')) {
              coloredMessage = message.replace('SUCCESS', chalk.green('SUCCESS'));
            } else if (message.includes('FAILED')) {
              coloredMessage = message.replace('FAILED', chalk.red('FAILED'));
            }
  
            // Colorize URLs in ping logs
            const urlMatch = message.match(/\[([^\]]+)\]/);
            if (urlMatch) {
              coloredMessage = coloredMessage.replace(urlMatch[0], `[${chalk.cyan(urlMatch[1])}]`);
            }
  
            // Colorize report headers and metrics
            if (message.includes('Choque Report')) {
              coloredMessage = message
                .replace(/--- Choque Report \((.*?)\) ---/, chalk.bold.cyan('--- Choque Report ($1) ---'))
                .replace(/Total Pings: (\d+)/, `Total Pings: ${chalk.white('$1')}`)
                .replace(/Successes: (\d+)/, `Successes: ${chalk.green('$1')}`)
                .replace(/Failures: (\d+)/, `Failures: ${chalk.red('$1')}`)
                .replace(/Average Response Time: ([\d.]+ms|N\/Ams)/, `Average Response Time: ${chalk.white('$1')}`);
            }
  
            return `${coloredTimestamp} ${coloredLevel} ${coloredMessage}`;
          })
        )
      }),
      // File transport (plain text)
      new transports.File({
        filename: path.join('logs', 'choque.log'),
        format: format.combine(
          format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ssZ' }),
          format.printf(({ timestamp, level, message }) => `${timestamp} ${level.toUpperCase()} ${message}`)
        )
      })
    ]
  });
// Load or initialize config
async function loadConfig(): Promise<Config> {
  const configPath = path.join(process.cwd(), 'choque-config.json');
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    const defaultConfig: Config = { urls: [], defaultInterval: 300000 }; 
    await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
}

// Save config
async function saveConfig(config: Config): Promise<void> {
  const configPath = path.join(process.cwd(), 'choque-config.json');
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

// Validate interval (1 minute to 10 hours)
function validateInterval(interval: number): number {
  const minInterval = 60 * 1000;
  const maxInterval = 10 * 60 * 60 * 1000; 
  return Math.max(minInterval, Math.min(maxInterval, interval));
}

// Ping a URL
async function pingUrl(url: string): Promise<PingResult> {
  const start = Date.now();
  const result: PingResult = {
    url,
    status: 'SUCCESS',
    timestamp: new Date().toISOString()
  };

  try {
    const response = await axios.head(url, { timeout: 5000 });
    result.statusCode = response.status;
    result.responseTime = Date.now() - start;
  } catch (error: any) {
    result.status = 'FAILED';
    result.error = error.message;
    if (error.response) {
      result.statusCode = error.response.status;
    }
  }

  return result;
}

// Log ping result
function logPingResult(result: PingResult): void {
  const message = `[${result.url}] ${result.status} ${result.statusCode || '-'} ${result.responseTime ? `${result.responseTime}ms` : '-'}${result.error ? ` [${result.error}]` : ''}`;
  logger.info(message);
}

// Generate summary report
async function generateReport(): Promise<void> {
  try {
    const logData = await fs.readFile(path.join('logs', 'choque.log'), 'utf-8');
    const lines = logData.split('\n').filter(line => line.includes('INFO') && (line.includes('SUCCESS') || line.includes('FAILED')));
    const totalPings = lines.length;
    const successes = lines.filter(line => line.includes('SUCCESS')).length;
    const failures = lines.filter(line => line.includes('FAILED')).length;
    const responseTimes = lines
      .map(line => {
        const match = line.match(/(\d+)ms/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(time => time > 0);
    const avgResponseTime = responseTimes.length
      ? (responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length).toFixed(2)
      : 'N/A';

    const report = `
--- Choque Report (${new Date().toISOString().split('T')[0]}) ---
Total Pings: ${totalPings}
Successes: ${successes}
Failures: ${failures}
Average Response Time: ${avgResponseTime}ms
`;
    console.log(report.trim()); 
    logger.info(report); 
  } catch (error) {
    logger.error(`Failed to generate report: ${error}`);
  }
}

// Start pinging
async function startPinging(): Promise<void> {
  const config = await loadConfig();
  if (config.urls.length === 0) {
    logger.error('No URLs configured. Add URLs using "choque add --url <url> --interval <seconds>".');
    process.exit(1);
  }

  for (const { url, interval } of config.urls) {
    const validatedInterval = validateInterval(interval || config.defaultInterval);
    logger.info(`Starting pings for ${url} every ${validatedInterval / 1000}s`);

    setInterval(async () => {
      const result = await pingUrl(url);
      logPingResult(result);
    }, validatedInterval);
  }
}

// CLI setup
program
  .name('choque')
  .description('CLI tool to keep servers alive by pinging URLs')
  .version('1.0.0');

program
  .command('start')
  .description('Start pinging configured URLs')
  .action(startPinging);

program
  .command('add')
  .description('Add a URL to ping')
  .option('--url <url>', 'URL to ping')
  .option('--interval <seconds>', 'Ping interval in seconds', parseInt)
  .action(async (options) => {
    if (!options.url || !options.interval) {
      logger.error('Both --url and --interval are required.');
      process.exit(1);
    }

    const config = await loadConfig();
    const validatedInterval = validateInterval(options.interval * 1000);
    config.urls.push({ url: options.url, interval: validatedInterval });
    await saveConfig(config);
    logger.info(`Added ${options.url} with interval ${validatedInterval / 1000}s`);
  });

program
  .command('report')
  .description('Generate a summary report')
  .action(generateReport);

program.parse(process.argv);