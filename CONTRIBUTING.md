# Contribution Guidelines 🤝

Thank you for contributing to **BharatEvents**! To ensure code quality and project consistency, please follow these guidelines:

---

## 1. Branch Naming Conventions

Always create a new branch for your changes:
*   Features: `feature/your-feature-name`
*   Bug fixes: `bugfix/your-bugfix-name`
*   Documentation: `docs/your-doc-name`
*   Refactoring: `refactor/your-refactor-name`

---

## 2. Standard Workflow

1.  **Fork the Repository**: Clone the repository to your local machine.
2.  **Create a Branch**: Create a branch off the `main` branch.
3.  **Implement Changes**: Follow code style guidelines, ensuring strict TypeScript types are used.
4.  **Run Compilation Checks**: Run the production build command in the frontend to check for errors:
    ```bash
    npm run build
    ```
5.  **Submit a Pull Request**: Provide a detailed description of the changes in your PR.
6.  **Code Review**: Address any feedback from the project maintainers before merging.

---

## 3. Code Style Guidelines

*   Use ES6 syntax and arrow functions.
*   Enforce strict TypeScript types; do not bypass with `any`.
*   Maintain clean indentation and follow ESLint best practices.
