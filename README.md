# Typesense Dashboard

A dashboard to manage [Typesense](https://typesense.org/)

## Usage

### Web

As a web application, only typesense server started with `--enable-cors` will work.

Use https://scarlson1.github.io/typesense-dashboard/ or clone the repository and run it locally.

### Docker

Download the repo and self-host with docker.

Example usage:

```bash
$ docker build -t typesense-dashboard .
$ docker run -d -p 80:80 typesense-dashboard
```

To use the latest pre-built image:

```bash
docker run -d -p 80:80 ghcr.io/bfritscher/typesense-dashboard:latest
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```
