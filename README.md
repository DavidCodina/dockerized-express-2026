# About This Project

This is a very simple dockerized Express/Postgres application, plus Prisma for the ORM.

It contains a `Dockerfile`, `docker-compose.dev.yaml`, and `docker-compose.prod.yaml`. Moreover, the `Dockerfile` is a multi-stage build that is triggered in one of two ways, depending on which `package.json` script is used:

```
"docker:up": "docker compose -f docker-compose.dev.yaml up --watch",
"docker:prod:up": "docker compose --env-file .env.production -f docker-compose.prod.yaml up --build",
```

The `docker:prod:up`, `docker-compose.prod.yaml` and `.env.production` are not intended for production deployment. They're used only for testing the production build locally. The actual deployment is triggered by a push to `main`, which then triggers Render to build the image from the `Dockerfile`.

## GitHub Repository + Render Auto Deploy

See Render documentation on [Building From A Dockerfile](https://render.com/docs/docker#building-from-a-dockerfile).

## Alternative: GitHub Container Registry + Render

**Log into GHCR:** Make sure you've created a GitHub personal access token first.

```
docker login ghcr.io --username YOUR_GITHUB_NAME --password YOUR_GITHUB_TOKEN
```

**Build Docker Image Locally:** Here, it's important for Render to specify `--platform linux/amd64`.

```
docker build --platform linux/amd64 --target production -t ghcr.io/YOUR_LOWERCASE_GITHUB_NAME/express-image:v1 .
```

**Push to GHCR:**

```
docker push ghcr.io/YOUR_LOWERCASE_GITHUB_NAME/express-image:v1
```

**Render Dashboard:** Back in the Render dashboard, click on **New Web Service**, select the **Existing Image** option, and add the URL:

```
docker pull ghcr.io/davidcodina/express-image:v1
```

Make sure to also add the optional credential info, since the GHCR image is private by default. The image will contain the Prisma `src/generated` folder, which may expose the database URL, so DO NOT make the image public.

Finally, click the **Connect** button and step through the rest of the basic instructions to deploy.

## main CI

The `.github/workflows/ci.yml` prevents merging pull requests to `main` when tests fail. This is enforced by branch protection on `main` that:

- Restricts deletions
- Requires a pull request before merging
- Requires status checks to pass
- Blocks force pushes

## Ideal Workflow For Small Project

Ideally, the workflow I would use for a small team is as follows:
feature branches → development → staging → main

- The `development` branch is highly dynamic, has its own automated CI workflow, no live deployment, and only accepts commits through pull requests.

- The `staging` branch would have a live deployment and its own cloud db (i.e., full CI/CD). It generally only accepts PRs from `development`. It essentially would be the pre-production sanity check, rather than having an additional pre-production stage. However, `staging` wouldn't necessarily sit for weeks before getting pushed to production.

- The `main` branch is synonymous with production and generally only accepts PRs from `staging`. Has full CI/CD.

This is roughly equivalent to the so-called the [practical strategy](https://www.youtube.com/watch?v=A3pmg8_zPgg), but with no live `development` deployment.
