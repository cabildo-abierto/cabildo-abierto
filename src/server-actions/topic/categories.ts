"use server"
import {db} from "../../db";
import { Prisma } from "@prisma/client";
import {currentCategories} from "@/components/topics/topic/utils";


export async function updateTopicsCategories() {
    const topics = await db.topic.findMany({
        select: {
            id: true,
            versions: {
                select: {
                    categories: true,
                    content: {
                        select: {
                            record: {
                                select: {
                                    createdAt: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    const topicCategories: { topicId: string; categoryIds: string[] }[] = topics.map(
        (t) => ({
            topicId: t.id,
            categoryIds: currentCategories(t)
        })
    );

    const t1 = Date.now();

    const allCategoryIds = [
        ...new Set(topicCategories.flatMap(({ categoryIds }) => categoryIds))
    ];

    if (allCategoryIds.length === 0) {
        console.log("No categories to update.");
        return;
    }

    // Step 1: Ensure all categories exist in TopicCategory
    await db.$executeRaw`
        INSERT INTO "TopicCategory" ("id")
        VALUES ${Prisma.join(allCategoryIds.map(id => Prisma.sql`(${id})`))}
        ON CONFLICT DO NOTHING;
    `;

    console.log("Ensured all categories exist.");

    // Step 2: Prepare topic-category relationships
    const topicCategoryValues = topicCategories.flatMap(({ topicId, categoryIds }) =>
        categoryIds.map(categoryId => Prisma.sql`(${topicId}, ${categoryId})`)
    );

    if (topicCategoryValues.length === 0) {
        console.log("No topic-category relationships to update.");
        return;
    }

    await db.$executeRaw`
        WITH new_data ("topicId", "categoryId") AS (
            VALUES ${Prisma.join(topicCategoryValues)}
        ),
        inserted AS (
            INSERT INTO "TopicToCategory" ("topicId", "categoryId")
            SELECT * FROM new_data
            ON CONFLICT DO NOTHING
        )
        DELETE FROM "TopicToCategory"
        WHERE ("topicId", "categoryId") NOT IN (SELECT * FROM new_data);
    `;

    console.log("Done after", Date.now() - t1);
}


