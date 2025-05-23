import { getDatabase } from "@shared/supabase/service.ts";
import { classify } from "@shared/ai/classifier.ts";

const db = getDatabase({ serviceRole: true });
if (typeof db === "string") throw new Error(db);

export type GetCategoryInput = {
  /** Represents the issue's ID */
  id: string;
  /** Represents the issue's Summary content */
  summaryContent: string;
};

const categories = {
  "Database": "database",
  "Security": "security",
  "File Storage": "storage",
  "Realtime Communication": "realtime",
  "Infrastrucure": "infrastructure",
};

export async function getCategory(
  payload: GetCategoryInput,
) {
  const predicts = await classify({
    text: payload.summaryContent,
    labels: Object.keys(categories),
  });
  // @ts-ignore: safety cause we did used 'Object.keys' as label input
  const category: keyof typeof categories = predicts.labels[0];

  const { error: saveCategoryError } = await db.from("issues")
    .update({
      category: categories[category], // use the value part
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.id);

  if (saveCategoryError) {
    console.error(saveCategoryError);

    throw new Error(
      saveCategoryError.message || SaveCategoryError(payload.id),
    );
  }

  console.log(
    "processed issue category",
    payload.id,
    category,
  );

  return predicts;
}

export const SaveCategoryError = (id: string) =>
  `could not determinate a category for issue with id: ${id}`;
