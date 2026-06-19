import {
  and,
  asc,
  desc,
  eq,
  or,
  getDb,
  templates,
  type Template,
} from "@murmur/db";

/** System templates + the user's custom templates, system first. */
export async function listTemplatesForUser(
  userId: string,
): Promise<Template[]> {
  const db = getDb();
  return db
    .select()
    .from(templates)
    .where(or(eq(templates.isSystem, true), eq(templates.userId, userId)))
    .orderBy(desc(templates.isSystem), asc(templates.name));
}

export async function getTemplateForUser(
  userId: string,
  id: string,
): Promise<Template | undefined> {
  const db = getDb();
  const [t] = await db
    .select()
    .from(templates)
    .where(
      and(
        eq(templates.id, id),
        or(eq(templates.isSystem, true), eq(templates.userId, userId)),
      ),
    )
    .limit(1);
  return t;
}
