-- Final Migration for Automated Synonym Denormalization

-- Step 1: Create the helper function to extract synonyms from JSONB
CREATE OR REPLACE FUNCTION get_synonyms_from_props(props jsonb)
RETURNS text[] AS $$
DECLARE
result_synonyms text[];
BEGIN
SELECT
    COALESCE(
            ARRAY_AGG(DISTINCT trim(lower(synonym))),
            '{}'::text[]
    )
INTO
    result_synonyms
FROM (
         SELECT jsonb_array_elements_text(
                        synonym_prop -> 'value' -> 'value'
                ) AS synonym
         FROM
             jsonb_array_elements(props) AS synonym_prop
         WHERE
             synonym_prop ->> 'name' = 'Sinónimos'
           AND jsonb_typeof(synonym_prop -> 'value' -> 'value') = 'array'
     ) AS synonyms_subquery
WHERE synonym IS NOT NULL AND trim(synonym) <> '';

RETURN result_synonyms;
END;
$$ LANGUAGE plpgsql;


-- Step 2: Create the trigger function for the Topic table
CREATE OR REPLACE FUNCTION update_topic_synonyms_from_version()
RETURNS TRIGGER AS $$
DECLARE
version_props jsonb;
BEGIN
    IF NEW."currentVersionId" IS NULL THEN
UPDATE "Topic" SET synonyms = '{}'::text[] WHERE id = NEW.id;
ELSE
SELECT props INTO version_props FROM "TopicVersion" WHERE uri = NEW."currentVersionId";
UPDATE "Topic"
SET synonyms = get_synonyms_from_props(version_props)
WHERE id = NEW.id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Step 3: Create the trigger function for the TopicVersion table
CREATE OR REPLACE FUNCTION update_referencing_topic_synonyms()
RETURNS TRIGGER AS $$
BEGIN
UPDATE "Topic"
SET synonyms = get_synonyms_from_props(NEW.props)
WHERE "currentVersionId" = NEW.uri;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Step 4: Attach the triggers to their respective tables

-- Attaches the trigger to the Topic table
CREATE OR REPLACE TRIGGER topic_synonyms_update_trigger
    AFTER INSERT OR UPDATE OF "currentVersionId" ON "Topic"
    FOR EACH ROW
    EXECUTE FUNCTION update_topic_synonyms_from_version();

-- Attaches the trigger to the TopicVersion table
CREATE OR REPLACE TRIGGER topic_version_synonyms_update_trigger
    AFTER INSERT OR UPDATE OF "props" ON "TopicVersion"
    FOR EACH ROW
    EXECUTE FUNCTION update_referencing_topic_synonyms();