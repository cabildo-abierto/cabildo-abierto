module.exports = {
    apps: [
        {
            name: "ca-frontend",
            script: "./node_modules/.bin/next",
            args: "start",
            cwd: "/var/www/cabildo-abierto",
            exec_mode: "cluster",
            instances: 2,
            listen_timeout: 50000,
            kill_timeout: 8000,
            env_production: {
                NODE_ENV: "production",
                PORT: 3000,
                NEXT_PUBLIC_BACKEND_URL: "https://api.cabildoabierto.ar",
                BACKEND_SSR_URL: "http://0.0.0.0:8080",
                PUBLIC_URL: "https://cabildoabierto.ar",
                NX_DAEMON: "",
                COOKIE_SECRET: "Gkio63Fd5ccpPPAwXym6L8z36ugL2WQpYr2iWCfQ70bUTEpDcae8A7URs1"
            }
        }
    ]
}