# Release Management Process 📦

Guidelines for compiling, tagging, and publishing official versions of **BharatEvents**.

---

## 1. Semantic Versioning Rules

We follow the [Semantic Versioning (SemVer)](https://semver.org/) format: `MAJOR.MINOR.PATCH`.
*   **MAJOR**: Incremented for incompatible API changes.
*   **MINOR**: Incremented for new, backwards-compatible functionality (e.g. adding the admin dashboard).
*   **PATCH**: Incremented for backwards-compatible bug fixes.

---

## 2. Release Steps

To publish a new release:

1.  **Branch Prep**: Pull the latest code into the `main` branch.
2.  **Verify compilation**: Run the production build checks:
    ```bash
    npm run build
    ```
3.  **Update Changelog**: Document the release changes in `CHANGELOG.md`.
4.  **Create Tag**: Create a git tag pointing to the release commit:
    ```bash
    git tag -a v1.1.0 -m "Release version 1.1.0"
    ```
5.  **Push to GitHub**: Push the branch and tags to the remote repository:
    ```bash
    git push origin main --tags
    ```
