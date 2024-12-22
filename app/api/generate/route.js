import OpenAI from "openai";
import fetch from "node-fetch"; // Import fetch for server-side image fetching

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  const { theme, method } = await req.json();

  try {
    if (method === "sliced") {
      // Generate the panoramic image
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `${theme}, a single continuous panoramic scene in a minimalistic style with clean lines, modern abstract elements, neutral tones, and muted pastels. No text, frames, or divisions, just one unified image.`,
        n: 1,
        size: "1792x1024",
      });

      const imageUrl = response.data[0].url;

      // Fetch the image and convert it to base64
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.buffer();
      const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;

      return new Response(
        JSON.stringify({ image: base64Image }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error generating or fetching image:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate triptych" }),
      { status: 500 }
    );
  }
}
