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
    DATASET_MAX_MB: num({default: 50}),
    DATASET_FRESH_SECONDS: num({default: 300}),
    DATASET_PREPARE_SECONDS: num({default: 120}),
    DATASET_PREPARE_MEMORY_MB: num({default: 512}),
    DATASET_PREPARE_TEMP_MB: num({default: 1024}),
    DATASET_QUERY_MAX_CELLS: num({default: 10000000}),
    DATASET_QUERY_MAX_MB: num({default: 100}),
    DATASET_RESULT_MAX_ROWS: num({default: 100000}),
    DATASET_RESULT_MAX_CELLS: num({default: 200000}),
    DATASET_RESULT_MAX_MB: num({default: 10}),
    SEARCH_URL_REFRESH_SECONDS: num({default: 300}),
    DOCUMENT_MAX_MB: num({default: 25}),
    DOCUMENT_TEXT_MAX_MB: num({default: 5}),
    LIBREOFFICE_PATH: str({default: 'libreoffice'}),
    DATABASE_URL: str(),
    DEV_DB_LATENCY_MS: num({default: 0}),
    MAX_CONNECTIONS: num({devDefault: 2}),
    RUN_CRONS: bool({devDefault: false}),
    MIRROR_EXTENDED_USERS: bool({devDefault: false}),
    REQUIRE_INVITE_CODE: bool({default: false}),
    WORKER_CONCURRENCY: num({devDefault: 1}),
    DEV_NAME: str(),
    SERVICE_NAME: str(),
})
