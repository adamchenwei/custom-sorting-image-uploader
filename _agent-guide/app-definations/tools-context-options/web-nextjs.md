- **Tech Stack**: 
    Next.js 14 (For UI App)
    Nodejs 20.10.0 (For Backend and CLI)
    TypeScript
    Playwright (For Regression Testing)
    Jest (For Unit Testing)
    - Read additional tools context in _agent-guide/app-definations/tools-context folder.

- **Authentication & Database**: 
    - Refer to `_agent-guide/app-user-input/context/app-definations-tool-context-selected.md` for auth setup selection.
    - Auth options available in `_agent-guide/app-definations/tools-context-options/auth-options/`

- **Environment Validation**:
    - Verify Node.js version matches requirement: `node --version` should show v20.10.0
    - Use nvm if needed: `source ~/.nvm/nvm.sh && nvm use`

- **Version Management**:
    - Version file: `package.json`
    - Read current version: `node -p "require('./package.json').version"`
    - Update version field in package.json using `edit` tool
    - Commit command: `git add package.json && git commit -m "chore(version): bump version to X.Y.Z" && git push`
    - Note: Some projects may have auto-bump mechanisms via git hooks (e.g., `lib/version.ts`)

- **Build Command**:
    - Production build: `npm run build`
    - Development: `npm run dev`
    - Verify build succeeds before committing changes

- **Code Quality Standards**:
    - Use TypeScript strict mode (`noImplicitAny`, `strictNullChecks`)
    - Use camelCase for variables/functions and PascalCase for classes/interfaces/components
    - No console.log statements in production code
    - All TypeScript errors must be resolved before commit
    - No unused imports or variables

- **Database Schema Management**:
    - Refer to the selected auth option in `_agent-guide/app-user-input/context/app-definations-tool-context-selected.md` for database-specific setup.

- **Regression Testing** (Playwright):
    - Create regression tests for happy path user flows
    - For AI agent iteration, create custom npm command: `npm run test:regression:ci`
    - Command should run: `playwright test --reporter=list` (uses list reporter for CI)
    - Include nvm setup if needed: `source ~/.nvm/nvm.sh && nvm use && playwright test --reporter=list`
    - Add command to package.json scripts
    - Un-testable features (camera/audio/screen recording, screenshots) only need unit tests
