# SimplifyCMS

## Overview

SimplifyCMS is a powerful Command Line Interface (CLI) tool designed to streamline content management system (CMS) project initialization, schema migration, and content synchronization.

## Features

- 🚀 Quick Project Initialization
- 🔐 Secure Authentication
- 📋 Schema Migration
- 🔄 Content Synchronization

## Prerequisites

- Node.js (version 14+ recommended)
- npm or yarn
- A web browser

## Installation

```bash
npm install -g simplifycms
# or
yarn global add simplifycms
```

## Configuration

Before using SimplifyCMS, you'll need to set up environment variables:

- `CMS_API_URL`: Your CMS API base URL
- `CMS_API_KEY`: Your authentication token
- `CMS_PROJECT_ID`: Your project's unique identifier
- `CMS_FRONT_URL`: Frontend URL for registration

## Commands

### Initialize Project

```bash
cms-cli init
```

This command will:
- Check if you have an account
- Open registration if needed
- Authenticate your credentials
- Create a new project
- Generate a `.env` file with project credentials

### Migrate Schemas

```bash
cms-cli migrate [-f schema.json]
```

Migrate your project schemas. Optionally specify a custom schema file.

### Sync Content

```bash
cms-cli sync
```

Synchronize your project's content with the CMS.

## Example Workflow

1. Run `cms-cli init`
2. Follow the interactive prompts
3. Create your project
4. Migrate your schemas: `cms-cli migrate`
5. Sync your content: `cms-cli sync`

## Environment Setup

Create a `.env` file in your project root with:

```
CMS_API_URL=https://your-cms-api.com
CMS_FRONT_URL=https://your-cms-frontend.com
CMS_API_KEY=your_api_key
CMS_PROJECT_ID=your_project_id
```

## Troubleshooting

- Ensure all environment variables are set
- Check your internet connection
- Verify API credentials
- Make sure you have the latest version of the CLI

## Security

- Always keep your `.env` file private
- Do not commit sensitive credentials to version control

## Version

Current version: 1.1.0

## Contributing

Contributions are welcome! Please submit pull requests or open issues on our GitHub repository.

## License

[Please add your specific license information]

## Support

For support, please contact [your support email or link to support documentation]