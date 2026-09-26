import dotenv from 'dotenv'
import {cleanEnv, host, port, str, num, testOnly, bool} from 'envalid'

dotenv.config()

export const env = cleanEnv(process.env, {
    NODE_ENV: str({
        devDefault: testOnly('test'),
        choices: ['development', 'production', 'test'],
    }),
    HOST: host({devDefault: testOnly('localhost')}),
    PORT: port({devDefault: testOnly(8080)}),
    PUBLIC_URL: str(),
    COOKIE_SECRET: str(),
    FRONTEND_URL: str({devDefault: 'http://127.0.0.1:3000'}),
    DIRECT_URL: str({default: ''}),
    ADMIN_TOKEN: str(),

    CLOUDFLARE_ACCOUNT_ID: str({default: ''}),
    CLOUDFLARE_ACCESS_KEY_ID: str({default: ''}),
    CLOUDFLARE_SECRET_ACCESS_KEY: str({default: ''}),
    CLOUDFLARE_BUCKET: str({default: ''}),
    DATASET_MAX_MB: num({default: 10}),
    DATASET_MAX_CELLS: num({default: 200000}),
    DOCUMENT_MAX_MB: num({default: 25}),
    DOCUMENT_TEXT_MAX_MB: num({default: 5}),
    LIBREOFFICE_PATH: str({default: 'libreoffice'}),
    DATABASE_URL: str(),
    MAX_CONNECTIONS: num({devDefault: 2}),
    RUN_CRONS: bool({devDefault: false}),
    MIRROR_EXTENDED_USERS: bool({devDefault: false}),
    REQUIRE_INVITE_CODE: bool({default: false}),
    WORKER_CONCURRENCY: num({devDefault: 1}),
    DEV_NAME: str(),
    SERVICE_NAME: str(),
})
