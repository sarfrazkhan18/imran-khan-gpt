import { IKContent, IKJSON } from "@/types";
import fs from "fs";
import { encode } from "gpt-3-encoder";
import { YoutubeTranscript } from "youtube-transcript";
import { Innertube } from "youtubei.js";

// Example video IDs - Replace with actual Imran Khan video IDs
const VIDEO_IDS = [
  "dQw4w9WgXcQ", // Example - replace with real IDs
  // Add more video IDs here
  // You can get these from:
  // - Imran Khan Official channel
  // - PTI Official channel
  // - Major speeches and interviews
];

const getVideoInfo = async (videoId: string, youtube: any) => {
  try {
    const info = await youtube.getInfo(videoId);
    return {
      title: info.basic_info.title || `Video ${videoId}`,
      duration: info.basic_info.duration || 0,
      uploadDate: info.primary_info?.published?.text || "",
    };
  } catch (error) {
    console.error(`Error fetching video info for ${videoId}:`, error);
    return null;
  }
};

const getYouTubeTranscript = async (videoId: string, youtube: any) => {
  try {
    // Try to get transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    // Combine transcript segments
    const fullText = transcript.map((item) => item.text).join(" ");

    // Get video metadata
    const videoInfo = await getVideoInfo(videoId, youtube);

    if (!videoInfo) {
      return null;
    }

    const content: IKContent = {
      id: `youtube_${videoId}`,
      title: videoInfo.title,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      date: videoInfo.uploadDate,
      source: "youtube",
      content: fullText.trim(),
      length: fullText.length,
      tokens: encode(fullText).length,
      chunks: [],
      video_id: videoId,
      video_duration: String(videoInfo.duration),
      language: "en", // Detect or set manually
    };

    return content;
  } catch (error) {
    console.error(`Error fetching transcript for ${videoId}:`, error);
    console.log(`Transcript may not be available for video: ${videoId}`);
    return null;
  }
};

(async () => {
  console.log("Starting YouTube scraping...");

  const youtube = await Innertube.create();
  const contents: IKContent[] = [];

  for (let i = 0; i < VIDEO_IDS.length; i++) {
    const videoId = VIDEO_IDS[i];
    console.log(`Processing ${i + 1}/${VIDEO_IDS.length}: ${videoId}`);

    const content = await getYouTubeTranscript(videoId, youtube);

    if (content) {
      contents.push(content);
      console.log(`✓ Successfully scraped: ${content.title}`);
    } else {
      console.log(`✗ Failed to scrape: ${videoId}`);
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const json: IKJSON = {
    current_date: new Date().toISOString().split("T")[0],
    author: "Imran Khan",
    url: "https://www.youtube.com/@ImranKhanOfficial",
    length: contents.reduce((acc, c) => acc + c.length, 0),
    tokens: contents.reduce((acc, c) => acc + c.tokens, 0),
    contents,
  };

  fs.writeFileSync("scripts/youtube-data.json", JSON.stringify(json, null, 2));
  console.log(`\n✓ Saved ${contents.length} videos to youtube-data.json`);
  console.log(`Total tokens: ${json.tokens}`);
})();
