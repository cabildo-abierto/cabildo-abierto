import {updateCategoriesGraph} from "#/services/wiki/graph.js";
import {Worker} from 'bullmq';
import {AppContext} from "#/setup.js";
import {syncAllUsers, syncUserJobHandler, updateRecordsCreatedAt} from "#/services/sync/sync-user.js";
import {updateAuthorStatus} from "#/services/user/users.js";
import {
    recreateAllReferences,
    updatePopularitiesOnContentsChange,
    updateReferences,
    updatePopularitiesOnTopicsChange,
    updatePopularitiesOnNewReactions, recomputeTopicInteractionsAndPopularities, updateDiscoverFeedIndex
} from "#/services/wiki/references/references.js";
import {updateEngagementCounts} from "#/services/feed/get-user-engagement.js";
import {deleteCollection} from "#/services/delete.js";
import {updateTopicsCategories} from "#/services/wiki/categories.js";
import {
    updateAllTopicContributions,
    updateTopicContributions,
    updateTopicContributionsRequired
} from "#/services/wiki/contributions.js";
import {createUserMonths} from "#/services/monetization/user-months.js";
import {Queue} from "bullmq";
import {createNotificationsJob} from "#/services/notifications/notifications.js";
import {CAHandler} from "#/utils/handler.js";
import {assignInviteCodesToUsers} from "#/services/user/access.js";
import {resetContentsFormat, updateContentsNumWords, updateContentsText} from "#/services/wiki/content.js";
import {updatePostLangs} from "#/services/admin/posts.js";
import {updateFollowSuggestions} from "#/services/user/follow-suggestions.js";
import {updateInteractionsScore} from "#/services/feed/feed-scores.js";
import {updateAllTopicsCurrentVersions} from "#/services/wiki/current-version.js";
import {Logger} from "#/utils/logger.js";
import {env} from "#/lib/env.js";
import {reprocessCollection} from "#/services/sync/reprocess.js";
import {runTestJob} from "#/services/admin/status.js";
import {clearAllRedis} from "#/services/redis/cache.js";
import {type Redis} from "ioredis/built/index.js"
import {updateAllTopicPopularities} from "#/services/wiki/references/popularity.js";
import {assignPayments} from "#/services/monetization/payments.js";
import {
    updateAllFollowingFeeds,
    updateFollowingFeedOnContentDelete,
    updateFollowingFeedOnFollowChange,
    updateFollowingFeedOnNewContent
} from "#/services/feed/following/update.js";

const mins = 60 * 1000
const seconds = 1000

type CAJobHandler<T> = (data: T) => Promise<void>

type CAJobDefinition<T> = {
    name: string
    handler: CAJobHandler<T>
    batchable: boolean
}


export class CAWorker {
    jobs: CAJobDefinition<any>[] = []
    logger: Logger

    constructor(logger: Logger) {
        this.logger = logger
    }

    runCrons() {
        return env.RUN_CRONS
    }

    registerJob(jobName: string, handler: (data: any) => Promise<void>, batchable: boolean = false) {
        this.jobs.push({name: jobName, handler, batchable})
    }

    async runJob(name: string, data: any) {
        for (let i = 0; i < this.jobs.length; i++) {
            if (name.startsWith(this.jobs[i].name)) {
                try {
                    await this.jobs[i].handler(data)
                } catch (error) {
                    this.logger.pino.error({job: name, error}, "error running job")
                }
                return
            }
        }
        this.logger.pino.warn({name}, "no handler for job")
    }

    async setup(ctx: AppContext) {
        this.registerJob("update-categories-graph", () => updateCategoriesGraph(ctx))
        this.registerJob("sync-user", async (data: any) => await syncUserJobHandler(ctx, data))
        this.registerJob("update-references", () => updateReferences(ctx))
        this.registerJob("update-engagement-counts", () => updateEngagementCounts(ctx))
        this.registerJob("delete-collection", async (data) => {
            await deleteCollection(ctx, (data as { collection: string }).collection)
        })
        this.registerJob("sync-all-users", (data) => syncAllUsers(ctx, (data as {
            mustUpdateCollections: string[]
        }).mustUpdateCollections))
        this.registerJob("delete-collection", (data) => deleteCollection(ctx, (data as {
            collection: string
        }).collection))
        this.registerJob(
            "update-topics-categories",
            () => updateTopicsCategories(ctx)
        )
        this.registerJob(
            "update-topic-contributions",
            (data) => updateTopicContributions(ctx, data as string[]),
            true
        )
        this.registerJob(
            "update-all-topic-contributions",
            () => updateAllTopicContributions(ctx)
        )
        this.registerJob(
            "required-update-topic-contributions",
            () => updateTopicContributionsRequired(ctx)
        )
        this.registerJob(
            "create-user-months",
            () => createUserMonths(ctx)
        )
        this.registerJob(
            "batch-create-notifications",
            (data) => createNotificationsJob(ctx, data),
            true
        )
        this.registerJob(
            "batch-jobs",
            () => this.batchJobs()
        )
        this.registerJob(
            "test-job",
            () => runTestJob(ctx)
        )
        this.registerJob(
            "assign-invite-codes",
            () => assignInviteCodesToUsers(ctx)
        )
        this.registerJob(
            "update-contents-text",
            () => updateContentsText(ctx)
        )
        this.registerJob(
            "update-num-words",
            () => updateContentsNumWords(ctx)
        )
        this.registerJob(
            "reset-contents-format",
            () => resetContentsFormat(ctx)
        )
        this.registerJob(
            "update-post-langs",
            () => updatePostLangs(ctx)
        )
        this.registerJob(
            "update-author-status-all",
            () => updateAuthorStatus(ctx)
        )
        this.registerJob(
            "update-author-status",
            (data) => updateAuthorStatus(ctx, data),
            true
        )
        this.registerJob(
            "assign-payments",
            () => assignPayments(ctx)
        )
        this.registerJob(
            "update-topics-current-versions",
            () => updateAllTopicsCurrentVersions(ctx)
        )
        this.registerJob(
            "update-follow-suggestions",
            () => updateFollowSuggestions(ctx)
        )
        this.registerJob(
            "update-records-created-at",
            () => updateRecordsCreatedAt(ctx)
        )
        this.registerJob(
            "update-interactions-score",
            (data) => updateInteractionsScore(ctx, data),
            true
        )
        this.registerJob(
            "update-all-interactions-score",
            () => updateInteractionsScore(ctx)
        )
        this.registerJob(
            "reprocess-collection",
            (data) => reprocessCollection(ctx, data.collection as string, data.onlyRecords as boolean)
        )
        this.registerJob(
            "update-topic-mentions",
            (data) => updatePopularitiesOnTopicsChange(ctx, data),
            true
        )
        this.registerJob(
            "update-contents-topic-mentions",
            (data) => updatePopularitiesOnContentsChange(ctx, data as string[]),
            true
        )
        this.registerJob(
            "update-topic-popularities-on-reactions",
            data => updatePopularitiesOnNewReactions(ctx, data as string[]),
            true
        )
        this.registerJob(
            "recreate-all-references",
            () => recreateAllReferences(ctx)
        )
        this.registerJob(
            "recompute-all-topic-interactions-and-popularities",
            () => recomputeTopicInteractionsAndPopularities(ctx)
        )
        this.registerJob(
            "clear-all-redis",
            () => clearAllRedis(ctx)
        )
        this.registerJob(
            "update-all-topics-popularities",
            () => updateAllTopicPopularities(ctx)
        )
        this.registerJob(
            "update-all-content-categories",
            () => updateDiscoverFeedIndex(ctx)
        )
        this.registerJob(
            "update-following-feed-on-new-content",
            (data) => updateFollowingFeedOnNewContent(ctx, data as string[]),
            true
        )
        this.registerJob(
            "update-following-feed-on-deleted-content",
            (data) => updateFollowingFeedOnContentDelete(ctx, data as string[]),
            true
        )
        this.registerJob(
            "update-following-feed-on-follow-change",
            (data) => updateFollowingFeedOnFollowChange(ctx, data as {follower: string, followed: string}[]),
            true
        )
        this.registerJob(
            "update-all-following-feeds",
            () => updateAllFollowingFeeds(ctx),
            true
        )

        this.logger.pino.info("worker jobs registered")

        await this.removeAllRepeatingJobs()
        this.logger.pino.info("repeating jobs cleared")

        if (this.runCrons()) {
            await this.addRepeatingJob("update-topics-categories", 30 * mins, 60 * mins + 5)
            await this.addRepeatingJob("update-categories-graph", 30 * mins, 60 * mins + 7)
            await this.addRepeatingJob("assign-payments", 30 * mins, 60 * mins + 15)
            await this.addRepeatingJob("batch-jobs", mins / 2, 0, 1)
            await this.addRepeatingJob("update-follow-suggestions", 30 * mins, 30 * mins + 18)
            await this.addRepeatingJob("update-all-interactions-score", 30 * mins, 30 * mins + 23)
            await this.addRepeatingJob("update-all-topics-popularities", 30 * mins, 30 * mins + 26)
            await this.addRepeatingJob("test-job", 20 * seconds, 20 * seconds, 14)
        } else {
            await this.addRepeatingJob("batch-jobs", mins / 2, 0, 1)
            await this.addRepeatingJob("test-job", 20 * seconds, 20 * seconds, 14)
            this.logger.pino.info("not running cron jobs")
        }

        await this.logState()

        await this.waitUntilReady()
    }

    async batchJobs() {
        throw Error("Sin implementar!")
    }

    async removeAllRepeatingJobs() {
        throw Error("Sin implementar!")
    }

    async addJob(name: string, data: any, priority: number = 10) {
        throw Error("Sin implementar!")
    }

    async waitUntilReady() {
        throw Error("Sin implementar!")
    }

    async logState() {
        throw Error("Sin implementar!")
    }

    async addRepeatingJob(name: string, every: number, delay: number, priority: number = 10) {
        throw Error("Sin implementar!")
    }

    async runAllJobs() {
        throw Error("Sin implementar!")
    }

    async clear() {
        throw Error("Sin implementar!")
    }
}



export class RedisCAWorker extends CAWorker {
    worker?: Worker
    ioredis: Redis
    queue: Queue
    jobs: CAJobDefinition<any>[] = []
    logger: Logger

    constructor(ioredis: Redis, worker: boolean, logger: Logger) {
        super(logger)
        this.logger = logger
        const envName = env.NODE_ENV
        const queueName = `${envName}-queue`
        const queuePrefix = undefined
        this.ioredis = ioredis
        this.logger.pino.info({queueName, queuePrefix}, `starting queue`)
        this.queue = new Queue(queueName, {
            prefix: queuePrefix,
            connection: ioredis
        })

        if (worker) {
            this.logger.pino.info({queueName, queuePrefix}, "starting worker")
            this.worker = new Worker(queueName, async (job) => {
                    await this.runJob(job.name, job.data)
                },
                {
                    connection: ioredis,
                    lockDuration: 60 * 1000 * 5,
                    concurrency: env.WORKER_CONCURRENCY
                }
            )
            this.worker.on('failed', (job, err) => {
                this.logger.pino.error({name: job?.name, error: err}, `job failed`);
            })
            this.worker.on('error', (err) => {
                this.logger.pino.error({error: err}, 'worker error');
            })
            this.worker.on('active', (job) => {
                this.logger.pino.info({name: job.name}, `job started`)
            })
            this.worker.on('completed', (job) => {
                this.logger.pino.info({name: job.name}, `job completed`)
            })
        }
    }

    async setup(ctx: AppContext) {
        await super.setup(ctx)
    }

    // priority va de 1 a 2097152, más bajo significa mayor prioridad
    async addJob(name: string, data: any, priority: number = 10) {
        this.logger.pino.info({name}, "job added")
        await this.queue.add(name, data, {priority})
    }

    async removeAllRepeatingJobs() {
        const jobs = await this.queue.getJobSchedulers()
        for (const job of jobs) {
            if (job.key) {
                this.logger.pino.info({name: job.name}, "repeat job removed")
                await this.queue.removeJobScheduler(job.key)
            }
        }
    }

    async addRepeatingJob(name: string, every: number, delay: number, priority: number = 10) {
        await this.queue.add(
            name,
            {},
            {
                repeat: {
                    every: every
                },
                priority: priority,
                jobId: `${name}-repeating`,
                delay: delay,
                removeOnComplete: true,
                removeOnFail: true,
            }
        )
        this.logger.pino.info({name}, "repeat job added")
    }

    async batchJobs() {
        const t1 = Date.now()

        const allJobs = await this.queue.getJobs(['waiting', 'delayed', 'prioritized', 'waiting-children', 'wait', 'repeat']);
        this.logger.pino.info({count: allJobs.length}, `batching jobs`)
        const batchSize = 500

        try {
            for (const job of this.jobs) {
                if (job.batchable) {
                    await this.batchJobsWithName(job.name, allJobs, batchSize)
                }
            }

            this.logger.logTimes("jobs batched", [t1, Date.now()])
        } catch (err) {
            this.logger.pino.error(err, "error batching jobs")
        }
    }


    // asume que la data del job es un array
    async batchJobsWithName(name: string, allJobs: any[], batchSize: number) {
        const jobs = allJobs.filter(job =>
            job && job.name == name
        );

        const jobsRequireBatching = jobs
            .filter(job => Array.isArray(job.data) && job.data.length < batchSize)

        if (jobsRequireBatching.length <= 1) {
            return
        }

        const jobData = jobsRequireBatching.flatMap(job => job.data)

        this.logger.pino.info({count: jobsRequireBatching.length, name}, `removing jobs`)
        await Promise.all(jobsRequireBatching.map(async job => {
            try {
                await job.remove()
            } catch (err) {
                this.logger.pino.error({name: job.name, error: err}, `error removing job`)
            }
        }))

        for (let i = 0; i < jobData.length; i += batchSize) {
            const batchData = jobData.slice(i, i + batchSize)
            await this.addJob(name, batchData)
        }
    }

    async logState() {
        const waitingJobs = await this.queue.getJobs(['waiting'])
        const delayedJobs = await this.queue.getJobs(['delayed'])

        this.logger.pino.info({
            waitingJobsCount: waitingJobs.length,
            delayedJobsCount: delayedJobs.length,
            waitingJobs: waitingJobs.map(j => (j ? {id: j.id, name: j.name} : null)),
            delayedJobs: delayedJobs.map(j => (j ? {id: j.id, name: j.name} : null)),
        }, "current jobs")
    }

    async waitUntilReady() {
        await this.queue.waitUntilReady()
    }
}


export const startJob: CAHandler<{jobData: any, params: {id: string}}, {}> = async (ctx, app, data) => {
    const {id} = data.params

    await ctx.worker?.addJob(id, data.jobData)

    return {data: {}}
}


export const getRegisteredJobs: CAHandler<{}, string[]> = async (ctx, agent, params) => {
    return {
        data: ctx.worker?.jobs?.map(j => j.name)
    }
}