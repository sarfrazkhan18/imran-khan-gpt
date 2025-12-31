import { IKContent, IKJSON } from "@/types";
import fs from "fs";
import { encode } from "gpt-3-encoder";
import { TwitterApi } from "twitter-api-v2";

const TWITTER_USERNAME = "ImranKhanPTI";
const MAX_TWEETS = 200; // Adjust based on your needs

const scrapeTwitter = async () => {
  // Check if credentials exist
  if (!process.env.TWITTER_BEARER_TOKEN) {
    console.error("Error: TWITTER_BEARER_TOKEN not found in environment variables");
    console.log("\nTo scrape Twitter data:");
    console.log("1. Apply for Twitter Developer Account: https://developer.twitter.com");
    console.log("2. Create a new app and get your Bearer Token");
    console.log("3. Add TWITTER_BEARER_TOKEN to your .env.local file");
    process.exit(1);
  }

  const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
  const readOnlyClient = client.readOnly;

  try {
    console.log(`Fetching tweets from @${TWITTER_USERNAME}...`);

    // Get user ID
    const user = await readOnlyClient.v2.userByUsername(TWITTER_USERNAME);

    if (!user.data) {
      throw new Error(`User @${TWITTER_USERNAME} not found`);
    }

    // Fetch tweets
    const tweets = await readOnlyClient.v2.userTimeline(user.data.id, {
      max_results: 100,
      "tweet.fields": ["created_at", "public_metrics", "lang"],
      exclude: ["retweets", "replies"], // Exclude retweets and replies
    });

    const contents: IKContent[] = [];

    for await (const tweet of tweets) {
      // Skip non-English tweets if desired, or include both English and Urdu
      // if (tweet.lang && tweet.lang !== 'en' && tweet.lang !== 'ur') continue;

      const tweetText = tweet.text;

      const content: IKContent = {
        id: `twitter_${tweet.id}`,
        title: `Tweet from ${new Date(tweet.created_at!).toLocaleDateString()}`,
        url: `https://twitter.com/${TWITTER_USERNAME}/status/${tweet.id}`,
        date: new Date(tweet.created_at!).toISOString().split("T")[0],
        source: "twitter",
        content: tweetText,
        length: tweetText.length,
        tokens: encode(tweetText).length,
        chunks: [],
        tweet_id: tweet.id,
        language: tweet.lang === "ur" ? "ur" : "en",
      };

      contents.push(content);

      // Stop if we've reached the maximum
      if (contents.length >= MAX_TWEETS) {
        break;
      }
    }

    const json: IKJSON = {
      current_date: new Date().toISOString().split("T")[0],
      author: "Imran Khan",
      url: `https://twitter.com/${TWITTER_USERNAME}`,
      length: contents.reduce((acc, c) => acc + c.length, 0),
      tokens: contents.reduce((acc, c) => acc + c.tokens, 0),
      contents,
    };

    fs.writeFileSync("scripts/twitter-data.json", JSON.stringify(json, null, 2));
    console.log(`\n✓ Saved ${contents.length} tweets to twitter-data.json`);
    console.log(`Total tokens: ${json.tokens}`);
  } catch (error) {
    console.error("Error fetching tweets:", error);
    process.exit(1);
  }
};

scrapeTwitter();
