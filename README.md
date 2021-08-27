# GamezBD Info (gamezbd-info)

GamezBD Info - A community made website that provide various convenient tools made for GamezBD's specific features. Include Failstack / Enhance Calculator, Market Calculator taking account of premium's silver collection bonus, Weekend Events Schedule, various Timers including game times / daily reset / imperial cooking alchemy delivery reset / imperial trading delivery reset / dice game reset / Vell Schedule / Server Status, Misc Infos like current running Events - Recent Patch Notes, and some Useful Links.

This project requires a deployed cloudflare serverless worker, source here: https://github.com/WeirdWood/cloudflare-workers

## Configure quasar.conf.js file with your worker's URL

```
....
build: {
    env: {
        WORKER_URL: ctx.dev ? "your-dev-worker-url.dev" : "your-production-worker-url.dev",
      },
}
....
```

## Install the dependencies

```bash
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
npm run lint
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.conf.js](https://v2.quasar.dev/quasar-cli/quasar-conf-js).
