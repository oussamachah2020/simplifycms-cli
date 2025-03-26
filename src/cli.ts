#!/usr/bin/env node

import { program } from 'commander';
import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';
import inquirer from 'inquirer'
import open from 'open';
import chalk from 'chalk';
import figlet from 'figlet';

dotenv.config();

interface Config {
  apiUrl: string | undefined;
  apiKey: string | undefined;
  projectId: string | undefined;
  frontUrl: string | undefined
}

const config: Config = {
  apiUrl: process.env.CMS_API_URL,
  apiKey: process.env.CMS_API_KEY,
  projectId: process.env.CMS_PROJECT_ID,
  frontUrl: process.env.CMS_FRONT_URL
};

// Helper function to check configuration
const checkConfig = (): void => {
  if (!config.apiUrl || !config.apiKey || !config.projectId) {
    console.error(
      'Error: CMS_API_URL, CMS_API_KEY, and CMS_PROJECT_ID must be set. Run "cms-cli init" first.',
    );
    process.exit(1);
  }
};

const displayWelcomeMessage = (email: string): void => {
  console.log(
    chalk.green(
      figlet.textSync('Welcome!', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      }),
    ),
  );
  console.log(chalk.cyan(`Hello, ${email}! You’re now logged into the CMS.`));
  console.log(chalk.yellow('Let’s get started with your project...\n'));
};

const createApiClient = (): AxiosInstance => {
  checkConfig();
  return axios.create({
    baseURL: `${config.apiUrl}/projects/${config.projectId}`,
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
};

// CLI setup
program
  .version('1.1.0')
  .description('CMS CLI for managing projects');

program
  .command("init")
  .description("Initialize connection to a CMS project")
  .action(async () => {
    try {
      const { hasAccount } = await inquirer.prompt([
        {
          type: "confirm",
          name: "hasAccount",
          message: "Do you already have an account ?",
          default: true,
        },
      ]);

      if (!hasAccount) {
        const registrationUrl = `${config.frontUrl}/sign-up`;
        console.log(`Opening registration page: ${registrationUrl}`);
        open(registrationUrl);
        console.log(
          "Please register in your browser, then return here to log in and continue."
        );
      }

      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "email",
          message: "Enter your email: ",
          validate: (input: string) => (input ? true : "Email is required"),
        },
        {
          type: "password",
          name: "password",
          message: "Enter your password",
          mask: "*",
          validate: (input: string) => (input ? true : "Password is required"),
        },
        {
          type: "input",
          name: "email",
          message: "Enter your email: ",
          validate: (input: string) => (input ? true : "Email is required"),
        },
      ]);

      const { email, password } = answers;

      const authResponse = await axios.post(`${config.apiUrl}/auth/login`, {
        email,
        password,
      });

      const apiKey = authResponse.data.accessToken;
      if (!apiKey) {
        throw new Error("Authentication failed: No token returned");
      }

      displayWelcomeMessage(answers.email);

      const input = await inquirer.prompt([
        {
          type: "input",
          name: "name",
          message: "Enter the project name: ",
          validate: (input: string) =>
            input ? true : "The project name is required",
        },
      ]);

      const { name } = input;

      const projectResponse = await axios.post(
        `${config.apiUrl}/project/create`,
        { name },
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );
      const projectId = projectResponse.data.projectId;
      if (!projectId) {
        throw new Error("API did not return a project ID");
      }

      const envContent = `CMS_PROJECT_ID=${projectId}\nCMS_API_KEY=${apiKey}`;
      fs.writeFileSync(path.resolve(process.cwd(), ".env"), envContent);

      console.log(`Project "${name}" created with ID: ${projectId}`);
    } catch (error: any) {
      console.error(
        "Error initializing project:",
        error.response?.data || error.message
      );
      process.exit(1);
    }
  });

program
  .command('migrate')
  .description('Migrate schemas to the CMS project')
  .option('-f, --file <schemaFile>', 'Path to schema file (JSON)', 'schema.json')
  .action(async (options: { file: string }) => {
    const apiClient = createApiClient();
    const schemaFilePath = path.resolve(process.cwd(), options.file);

    try {
      const schema = JSON.parse(fs.readFileSync(schemaFilePath, 'utf-8'));
      const response = await apiClient.post('/schemas/migrate', schema);
      console.log('Schema migrated successfully:', response.data);
    } catch (error: any) {
      console.error(
        'Error migrating schema:',
        error.response?.data || error.message,
      );
    }
  });

program
  .command('sync')
  .description('Sync content with the CMS project')
  .action(async () => {
    const apiClient = createApiClient();

    try {
      const response = await apiClient.get('/content');
      console.log('Content synced:', response.data);
    } catch (error: any) {
      console.error(
        'Error syncing content:',
        error.response?.data || error.message,
      );
    }
  });

// Parse CLI arguments
program.parse(process.argv);