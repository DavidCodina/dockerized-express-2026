# About This Project

This is a very simple Dockerized Express application.
It contains a `Dockerfile`, `docker-compose.dev.yaml`, and `docker-compose.prod.yaml`. Moreover, the `Dockerfile` is a multi-stage build that is triggered in one of two ways, depending on which `package.json` script is used:

```
"docker:up": "docker compose -f docker-compose.dev.yaml up --watch",
"docker:prod:up": "docker compose --env-file .env.production -f docker-compose.prod.yaml up -d --build",
```

That said, I'm currently not using `docker:prod:up` or the `docker-compose.prod.yaml` for the production deployment. Instead, I'm using GitHub Container Registry in conjunction with [render.com](https://render.com/) to deploy the image.

## GitHub Container Registry + Render

**Log into GHCR:** Make sure you've created a GitHub personal access token first.

```
docker login ghcr.io --username YOUR_GITHUB_NAME --password ghp_abc123
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

Make sure to also add the optional credential info, since the GHCR image is private by default. Finally, click the **Connect** button and step through the rest of the basic instructions to deploy.

## Next Steps

Again, this is a very basic implementation strictly for testing deployment of production Docker images. The next step is to integrate an SQL database and Prisma.
