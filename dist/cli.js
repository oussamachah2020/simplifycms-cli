#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const inquirer_1 = __importDefault(require("inquirer"));
const open_1 = __importDefault(require("open"));
const chalk_1 = __importDefault(require("chalk"));
const figlet_1 = __importDefault(require("figlet"));
dotenv.config();
const config = {
    apiUrl: process.env.CMS_API_URL,
    apiKey: process.env.CMS_API_KEY,
    projectId: process.env.CMS_PROJECT_ID,
    frontUrl: process.env.CMS_FRONT_URL
};
// Helper function to check configuration
const checkConfig = () => {
    if (!config.apiUrl || !config.apiKey || !config.projectId) {
        console.error('Error: CMS_API_URL, CMS_API_KEY, and CMS_PROJECT_ID must be set. Run "cms-cli init" first.');
        process.exit(1);
    }
};
const displayWelcomeMessage = (email) => {
    console.log(chalk_1.default.green(figlet_1.default.textSync('Welcome!', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
    })));
    console.log(chalk_1.default.cyan(`Hello, ${email}! You’re now logged into the CMS.`));
    console.log(chalk_1.default.yellow('Let’s get started with your project...\n'));
};
// Create an Axios instance with config
const createApiClient = () => {
    checkConfig();
    return axios_1.default.create({
        baseURL: `${config.apiUrl}/projects/${config.projectId}`,
        headers: { Authorization: `Bearer ${config.apiKey}` },
    });
};
// CLI setup
commander_1.program
    .version('1.0.0')
    .description('CMS CLI for managing projects');
commander_1.program
    .command('init')
    .description("Initialize connection to a CMS project")
    .action(async () => {
    var _a;
    try {
        const { hasAccount } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'hasAccount',
                message: 'Do you already have an account ?',
                default: true,
            },
        ]);
        if (!hasAccount) {
            // Open registration page in browser
            const registrationUrl = `${config.frontUrl}/sign-up`; // Adjust based on your CMS URL structure
            console.log(`Opening registration page: ${registrationUrl}`);
            (0, open_1.default)(registrationUrl);
            console.log('Please register in your browser, then return here to log in and continue.');
        }
        const answers = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'email',
                message: "Enter your email: ",
                validate: (input) => (input ? true : "Email is required")
            },
            {
                type: "password",
                name: "password",
                message: "Enter your password",
                mask: "*",
                validate: (input) => (input ? true : "Password is required")
            },
            {
                type: 'input',
                name: 'email',
                message: "Enter your email: ",
                validate: (input) => (input ? true : "Email is required")
            },
        ]);
        const { email, password } = answers;
        const authResponse = await axios_1.default.post(`${config.apiUrl}/auth/login`, { email, password });
        const apiKey = authResponse.data.accessToken;
        if (!apiKey) {
            throw new Error("Authentication failed: No token returned");
        }
        displayWelcomeMessage(answers.email);
        const input = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'name',
                message: "Enter the project name: ",
                validate: (input) => (input ? true : "The project name is required")
            },
        ]);
        const { name } = input;
        const projectResponse = await axios_1.default.post(`${config.apiUrl}/project/create`, { name }, { headers: { Authorization: `Bearer ${apiKey}` } });
        const projectId = projectResponse.data.projectId;
        if (!projectId) {
            throw new Error("API did not return a project ID");
        }
        const envContent = `CMS_PROJECT_ID=${projectId}\nCMS_API_KEY=${apiKey}`;
        fs.writeFileSync(path.resolve(process.cwd(), '.env'), envContent);
        console.log(`Project "${name}" created with ID: ${projectId}`);
    }
    catch (error) {
        console.error('Error initializing project:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        process.exit(1);
    }
});
// Migrate schemas command
commander_1.program
    .command('migrate')
    .description('Migrate schemas to the CMS project')
    .option('-f, --file <schemaFile>', 'Path to schema file (JSON)', 'schema.json')
    .action(async (options) => {
    var _a;
    const apiClient = createApiClient();
    const schemaFilePath = path.resolve(process.cwd(), options.file);
    try {
        const schema = JSON.parse(fs.readFileSync(schemaFilePath, 'utf-8'));
        const response = await apiClient.post('/schemas/migrate', schema);
        console.log('Schema migrated successfully:', response.data);
    }
    catch (error) {
        console.error('Error migrating schema:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
    }
});
// Sync content command
commander_1.program
    .command('sync')
    .description('Sync content with the CMS project')
    .action(async () => {
    var _a;
    const apiClient = createApiClient();
    try {
        const response = await apiClient.get('/content');
        console.log('Content synced:', response.data);
    }
    catch (error) {
        console.error('Error syncing content:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
    }
});
// Parse CLI arguments
commander_1.program.parse(process.argv);
