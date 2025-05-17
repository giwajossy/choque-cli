Contributing to Choque-cli

Thank you for your interest in contributing to Choque-cli, an open-source CLI tool to keep servers awake by pinging URLs! We welcome contributions from the community to make Choque better for everyone. This guide outlines how to contribute.

Getting Started
---------------
1. Fork the Repository
   - Fork the Choque-cli repository on GitHub to your account.
   - Clone your fork:
     ```
     git clone https://github.com/giwajossy/choque-cli.git
     cd choque-cli
     ```

2. Set Up the Project
   - Ensure Node.js (v16 or higher) is installed.
   - Install dependencies:
     ```
     npm install
     ```
   - Build the project:
     ```
     npm run build
     ```
   - Create the logs directory:
     ```
     mkdir logs
     ```

3. Explore the Code
   - The main logic is in `src/index.ts`.
   - Configuration is in `choque-config.json`.
   - Logs are saved to `logs/choque.log`.

Contribution Guidelines
----------------------
- Code Style
  - Follow TypeScript conventions and maintain type safety.
  - Use consistent formatting (handled by the `tsconfig.json` settings).
  - Write clear, concise code with comments for complex logic.

- Submitting Changes
  - Create a new branch for your feature or bug fix:
    ```
    git checkout -b feature/your-feature-name
    ```
  - Make your changes and test thoroughly.
  - Commit with clear messages:
    ```
    git commit -m "Add feature: describe your change"
    ```
  - Push to your fork:
    ```
    git push origin feature/your-feature-name
    ```
  - Open a pull request (PR) on the main Choque-cli repository.

- Pull Request Process
  - Describe your changes in the PR, including the problem solved and how to test it.
  - Ensure your code builds (`npm run build`) and runs without errors.
  - Reference any related issues (e.g., "Fixes #123").
  - A maintainer will review your PR. Be open to feedback and make requested changes.

- Testing
  - Test your changes locally with:
    ```
    npx choque start
    npx choque add --url https://example.com --interval 300
    npx choque report
    ```
  - Ensure no regressions in existing functionality.
  - Add tests if you introduce new features (testing framework TBD).

- Reporting Issues
  - Use the GitHub Issues page to report bugs or suggest features.
  - Provide a clear description, steps to reproduce, and expected behavior.

Code of Conduct
--------------
- Be respectful and inclusive in all interactions.
- Follow the open-source community standards for collaboration.

License
-------
By contributing, you agree that your contributions will be licensed under the MIT License.

Contact
-------
For questions, reach out via GitHub Issues or Discussions. Happy contributing!