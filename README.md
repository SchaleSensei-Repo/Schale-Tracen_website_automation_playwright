# Schale-Tracen Website Automation Testing

[![Playwright Tests](https://github.com/SchaleSensei-Repo/Schale-Tracen_website_automation_playwright/actions/workflows/playwright.yml/badge.svg)](https://github.com/SchaleSensei-Repo/Schale-Tracen_website_automation_playwright/actions/workflows/playwright.yml)
[![License](https://img.shields.io/github/license/SchaleSensei-Repo/Schale-Tracen_website_automation_playwright)](https://github.com/SchaleSensei-Repo/Schale-Tracen_website_automation_playwright/blob/main/LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)

A comprehensive Playwright test suite for smoke testing the Schale-Tracen website (https://schale-tracen.my.id). This project focuses on automated testing of key website functionalities to ensure reliability and proper operation.

## Video Evidence

[View the Playwright Automation Testing in action](https://youtu.be/aZGGMJUaBQw)

## Features Tested

The test suite covers the following main areas:

### Home Page Tests
- **Page Loading**: Verifies that the home page loads correctly with expected sections (Websites, Weather)
- **Weather Widget**: Tests the wttr.in weather module functionality, including location dropdown changes (Tokyo, Sagami-Ono)
- **Navigation**: Ensures navigation to the Games page works properly
- **Search Functionality**: Tests the FMHY search feature with filtering capabilities
- **FreshRSS Integration**: Verifies that the News/FreshRSS link is accessible and loads without errors

### Games Page Tests
- **Games List Loading**: Confirms that the games list loads and displays properly
- **Game Links**: Validates that game entries have valid href attributes

### Pico-8 Games Tests
- **Random Game Selection**: Tests loading and running of random Pico-8 games from the games list
- **Canvas Interaction**: Verifies that the game canvas becomes visible after user interaction
- **Error Handling**: Ensures no uncaught runtime errors occur during game loading

### React Games Tests
- **Random Game Selection**: Tests loading and running of random React-based games
- **Content Rendering**: Validates that games render meaningful content and are interactive
- **Error Handling**: Ensures no uncaught runtime errors occur during game loading

### Tools Page Tests
- **Money Conversion Tool**: Tests loading, running, and calculation correctness of the currency conversion tool with random currency pairs
- **Currency Swap**: Validates that swapping From/To currencies updates the UI lines accordingly
- **Gold Calculator**: Tests calculation accuracy for random weight inputs in default Weight → Value mode using spot prices and FX rates
- **Random React Tools**: Tests loading and running of random React-based tools from the tools list

## Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/SchaleSensei-Repo/Schale-Tracen_website_automation_playwright.git
cd Schale-Tracen_website_automation_playwright
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

## Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. The default configuration points to the production site. Modify `.env` if you need to test against a different environment:
```
BASE_URL=https://schale-tracen.my.id
```

## Running Tests

### Headless Mode (No Browser UI)
Run tests in headless mode without visible browser:
```bash
npx playwright test
```

### Headed Mode (With Browser UI)
Run tests with visible browser window:
```bash
VISUAL=1 npx playwright test
```

### Additional Options

#### Interactive UI Mode
```bash
npm run test:ui
```

#### View Test Reports
```bash
npm run report
```

## Project Structure

```
├── .github/
│   └── workflows/
│       └── playwright.yml    # GitHub Actions CI/CD workflow
├── tests/
│   └── smoke/                 # Smoke test specifications
│       ├── games.spec.ts      # Games page tests
│       ├── home.spec.ts       # Home page tests
│       ├── pico8.spec.ts      # Pico-8 games tests
│       ├── react.spec.ts      # React games tests
│       ├── tools-fx.spec.ts   # Money conversion tool tests
│       ├── tools-fx-swap.spec.ts  # Currency swap tests
│       ├── tools-gold.spec.ts # Gold calculator tests
│       └── tools-react.spec.ts # React tools tests
├── pages/                     # Page Object Model classes
│   ├── GamesPage.ts          # Games page interactions
│   └── HomePage.ts           # Home page interactions
├── utils/                     # Utility functions
│   └── tools.ts               # Playwright test utilities (parsing, assertions, etc.)
├── playwright.config.ts      # Playwright configuration
├── package.json              # Project dependencies and scripts
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## Configuration

The project uses Playwright's configuration file (`playwright.config.ts`) with the following key settings:

- **Test Directory**: `./tests`
- **Workers**: 2 in CI, 1 in visual mode, undefined otherwise
- **Timeouts**: 30 seconds for tests, 10 seconds for expectations
- **Retries**: 1 retry for network reliability
- **Base URL**: Configurable via `BASE_URL` environment variable
- **Browser Mode**: Headless in CI, headed when `VISUAL=1`
- **Tracing**: Enabled on first retry
- **Screenshots**: Taken only on failures
- **Videos**: Retained on failures

## CI/CD

This project uses GitHub Actions for continuous integration. The workflow automatically runs the test suite on every push and pull request.

### Workflow Configuration

The GitHub Actions workflow (`.github/workflows/playwright.yml`) includes the following steps:

1. **Checkout Code**: Uses `actions/checkout@v4` to clone the repository
2. **Setup Node.js**: Uses `actions/setup-node@v4` with Node.js version 20
3. **Install Dependencies**: Runs `npm ci` for clean installation
4. **Install Playwright Browsers**: Runs `npx playwright install --with-deps` to install browsers and system dependencies
5. **Run Tests**: Executes `npm test` with `BASE_URL=https://schale-tracen.my.id`
6. **Upload Report on Failure**: If tests fail, uploads the Playwright report as an artifact using `actions/upload-artifact@v4`

The workflow has a 15-minute timeout and runs on `ubuntu-latest`.

## Test Structure

The tests follow the Page Object Model pattern for better maintainability:

- **HomePage.ts**: Encapsulates home page elements and actions (navigation, search, weather selection)
- **GamesPage.ts**: Handles games page interactions (loading, game list access)
- **utils/tools.ts**: Provides utility functions for Playwright tests including number parsing, random option selection, and approximate value assertions

All tests are located in the `tests/smoke/` directory and use descriptive naming conventions.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-test`
3. Add your tests following the existing patterns
4. Ensure tests pass: `npm test`
5. Commit your changes: `git commit -am 'Add new test for X'`
6. Push to the branch: `git push origin feature/new-test`
7. Submit a pull request

## License

ISC
