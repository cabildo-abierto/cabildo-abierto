import dotenv from 'dotenv'
import {cleanEnv, host, port, str, num, testOnly, bool} from 'envalid'

dotenv.config()

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    devDefault: testOnly('test'),
    choices: ['development', 'production', 'test'],
  }),
  HOST: host({ devDefault: testOnly('localhost') }),
  PORT: port({ devDefault: testOnly(8080) }),
  PUBLIC_URL: str(),
  COOKIE_SECRET: str(),
  FRONTEND_URL: str({ devDefault: 'http://127.0.0.1:3000' }),
  MP_ACCESS_TOKEN: str(),
  MP_WEBHOOK_KEY: str(),
  ADMIN_TOKEN: str(),
  REDIS_URL: str(),
  CLOUDFLARE_ACCOUNT_ID: str(),
  CLOUDFLARE_ACCESS_KEY_ID: str(),
  CLOUDFLARE_SECRET_ACCESS_KEY: str(),

  DATABASE_URL: str(),
  DIRECT_URL: str(),
  MAX_REPO_MBS: num({devDefault: 300}),
  MAX_CONNECTIONS: num({devDefault: 2}),
  RUN_CRONS: bool({devDefault: false}),
  MIRROR_EXTENDED_USERS: bool({devDefault: false})
})
