"use server"
import {db} from "../../db";
import {sanitizedId} from "../utils";
import {currentCategories} from "../../components/utils/utils";


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
            categoryIds: currentCategories(t) // Should return an array of category IDs
        })
    );

    const t1 = Date.now();

    // Collect all unique category IDs
    const allCategoryIds = [
        ...new Set(topicCategories.flatMap(({ categoryIds }) => categoryIds))
    ];

    if (allCategoryIds.length === 0) {
        console.log("No categories to update.");
        return;
    }

    // Step 1: Ensure all categories exist in TopicCategory
    const categoryValues = allCategoryIds.map(id => `('${id}')`).join(",\n");

    const insertCategoriesQuery = `
        INSERT INTO "TopicCategory" ("id")
        VALUES ${categoryValues}
        ON CONFLICT DO NOTHING;
    `;

    await db.$executeRawUnsafe(insertCategoriesQuery);
    console.log("Ensured all categories exist.");

    // Step 2: Update TopicToCategory relationships
    const values = topicCategories.flatMap(({ topicId, categoryIds }) =>
        categoryIds.map(categoryId => `('${topicId}', '${categoryId}')`)
    ).join(",\n");

    if (values.length === 0) {
        console.log("No topic-category relationships to update.");
        return;
    }

    const updateRelationsQuery = `
        WITH new_data AS (
            VALUES ${values}
        ),
        inserted AS (
            INSERT INTO "TopicToCategory" ("topicId", "categoryId")
            SELECT * FROM new_data
            ON CONFLICT DO NOTHING
        )
        DELETE FROM "TopicToCategory"
        WHERE ("topicId", "categoryId") NOT IN (SELECT * FROM new_data);
    `;

    await db.$executeRawUnsafe(updateRelationsQuery);

    console.log("Done after", Date.now() - t1);
}

