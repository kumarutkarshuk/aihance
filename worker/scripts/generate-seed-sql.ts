import { CURATED_TAGS } from "../seed/curated-tags";

const lines = [
  "-- Generated from seed/curated-tags.ts. Do not edit by hand.",
  ...CURATED_TAGS.map(
    (tag) =>
      `INSERT OR IGNORE INTO tags (slug, display_name) VALUES ('${tag.slug}', '${tag.displayName.replace(/'/g, "''")}');`,
  ),
  "",
];

await Bun.write(new URL("../seed/seed.sql", import.meta.url), lines.join("\n"));
console.log(`Wrote ${CURATED_TAGS.length} tags to seed/seed.sql`);
