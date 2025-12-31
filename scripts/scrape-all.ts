import { IKJSON } from "@/types";
import fs from "fs";

/**
 * This script combines data from multiple sources into a single JSON file
 * Run individual scrapers first:
 * - npm run scrape:youtube
 * - npm run scrape:twitter
 */

(async () => {
  console.log("Combining all data sources...\n");

  const allContents: IKJSON = {
    current_date: new Date().toISOString().split("T")[0],
    author: "Imran Khan",
    url: "https://imrankhan.pk",
    length: 0,
    tokens: 0,
    contents: [],
  };

  // Load YouTube data if it exists
  try {
    if (fs.existsSync("scripts/youtube-data.json")) {
      const youtubeData: IKJSON = JSON.parse(
        fs.readFileSync("scripts/youtube-data.json", "utf8")
      );
      allContents.contents.push(...youtubeData.contents);
      console.log(`✓ Loaded ${youtubeData.contents.length} YouTube videos`);
    } else {
      console.log("⚠ YouTube data not found (run: npm run scrape:youtube)");
    }
  } catch (error) {
    console.error("Error loading YouTube data:", error);
  }

  // Load Twitter data if it exists
  try {
    if (fs.existsSync("scripts/twitter-data.json")) {
      const twitterData: IKJSON = JSON.parse(
        fs.readFileSync("scripts/twitter-data.json", "utf8")
      );
      allContents.contents.push(...twitterData.contents);
      console.log(`✓ Loaded ${twitterData.contents.length} tweets`);
    } else {
      console.log("⚠ Twitter data not found (run: npm run scrape:twitter)");
    }
  } catch (error) {
    console.error("Error loading Twitter data:", error);
  }

  // Calculate totals
  allContents.length = allContents.contents.reduce((acc, c) => acc + c.length, 0);
  allContents.tokens = allContents.contents.reduce((acc, c) => acc + c.tokens, 0);

  // Save combined data
  fs.writeFileSync("scripts/ik-data.json", JSON.stringify(allContents, null, 2));

  console.log("\n✓ Combined data saved to ik-data.json");
  console.log(`Total contents: ${allContents.contents.length}`);
  console.log(`Total tokens: ${allContents.tokens}`);
  console.log("\nBreakdown by source:");

  const sourceCount = allContents.contents.reduce((acc, content) => {
    acc[content.source] = (acc[content.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(sourceCount).forEach(([source, count]) => {
    console.log(`  ${source}: ${count}`);
  });

  console.log("\nNext step: Run 'npm run ingest' to process and embed the data");
})();
