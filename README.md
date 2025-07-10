# Typesense Dashboard

A dashboard to manage self hosted or local [Typesense](https://typesense.org/) instances.

Reference the [Typesense installation docs](https://typesense.org/docs/guide/install-typesense.html) to set up a new cluster.

## Usage

### Web

As a web application, only typesense server started with `--enable-cors` will work.

Use https://scarlson1.github.io/typesense-dashboard/ or clone the repository and run it locally. (Typesense config must be configured with SSL or you'll get "ERR_NETWORK Network Error")

Use an admin key to authenticate. Cluster credentials are stored in session storage and will be removed when the window is closed.

### Docker

Download the repo and self-host with docker.

Example usage:

```bash
$ git clone git@github.com:scarlson1/typesense-dashboard.git
$ docker build -t typesense-dashboard .
$ docker run -d -p 80:80 typesense-dashboard
```

<!-- To use the latest pre-built image:

```bash
docker run -d -p 80:80 ghcr.io/scarlson1/typesense-dashboard:latest
``` -->

## Limitations/Issues

TODO

## TODO

- Tests
- [Filter operators](https://typesense.org/docs/guide/tips-for-filtering.html#available-operators)
- [Boolean operators](https://typesense.org/docs/guide/tips-for-filtering.html#boolean-operations)
- [Geo operators](https://typesense.org/docs/guide/tips-for-filtering.html#filtering-geopoints)
- Search result view customization
- Improve search implementation
- Delete documents by query

## Screenshots

![API keys](docs/images/api_keys.png)

![search](docs/images/search.png)

![search parameters](docs/images/search_params.png)

![server status](docs/images/server_status.png)

![collections](docs/images/collections.png)

![edit collection schema](docs/images/edit_collection.png)

![add documents](docs/images/add_documents.png)

![alias](docs/images/alias.png)

![presets](docs/images/presets.png)

![synonyms](docs/images/synonyms.png)

![analytics rules](docs/images/analytics_rules.png)

# Development

#### Install dependencies

```bash
npm install
```

#### run locally

```bash
npm run dev
```
