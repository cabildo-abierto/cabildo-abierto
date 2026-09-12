import {randomUUID} from "node:crypto";
import {setupAppContext} from "#/setup.js";
import {hashPassword} from "#/auth/password.js";

const testUsers = ["prueba01", "prueba02", "prueba03"].map(username => ({
    username,
    email: `${username}@gmail.com`,
}));

async function run() {
    const {ctx} = await setupAppContext([]);
    try {
        const passwordHash = await hashPassword("123");
        for (const user of testUsers) {
            await ctx.kysely.insertInto("user").values({
                id: randomUUID(),
                username: user.username,
                email: user.email,
                password_hash: passwordHash,
            }).onConflict(oc => oc.column("username").doUpdateSet({
                email: user.email,
                password_hash: passwordHash,
            })).execute();
            console.log(`Usuario de prueba listo: ${user.username} (${user.email})`);
        }
    } finally {
        await ctx.kysely.destroy();
    }
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
