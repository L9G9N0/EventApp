# Support & Troubleshooting Help 💬

If you run into issues while setting up or using **BharatEvents**, here is how you can get help:

---

## 1. Getting Help

*   **GitHub Issues**: For bugs, feature requests, and documentation feedback, search existing issues or open a new one on the GitHub repository.
*   **Discord / Slack**: For community questions, reach out to the project channels.
*   **Maintainer Contact**: For private or security queries, email the maintainers directly.

---

## 2. Common Troubleshooting Steps

1.  **Server selection issues**: Make sure your local MongoDB instance is running on port 27017.
2.  **Port conflicts**: If port 3000 (frontend) or 5001 (backend) is already in use, kill the hanging processes and restart:
    ```bash
    lsof -t -i:5001 | xargs kill -9
    ```
3.  **Out-of-sync dependencies**: Delete the `node_modules` folders, reinstall dependencies, and restart:
    ```bash
    npm run install:all
    ```
