# Project Guidelines & Rules

## GitHub Pages Auto-Deploy Rule
- Whenever making any updates or code modifications to the repository, ALWAYS build (`npm run build`), stage, commit, and push the changes to the `main` branch on GitHub (`git push origin main`).
- The repository has a GitHub Actions workflow (`.github/workflows/main.yml`) that automatically builds and deploys the site to GitHub Pages whenever changes are pushed to `main`.
