import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function test() {
  try {
    console.log("Ì¥Ñ Testing Anthropic API connection...\n");
    
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: "Say hello and confirm the API is working! Also tell me which Claude model you are.",
        },
      ],
    });

    const content = message.content[0];
    if (content.type === "text") {
      console.log("‚úÖ API Key is working perfectly!\n");
      console.log("Ì≥ù Response from Claude:\n");
      console.log(content.text);
      console.log("\n" + "=".repeat(50));
      console.log("‚úÖ Setup successful! You can now use:");
      console.log("   npm run claude review <file>");
      console.log("   npm run claude optimize <file>");
      console.log("   npm run claude explain <file>");
      console.log("=".repeat(50) + "\n");
    }
  } catch (error: any) {
    console.error("‚ùå API Key test failed!\n");
    
    if (error.message?.includes("Invalid API Key")) {
      console.error("Error: Invalid API Key");
      console.error("\nTroubleshooting:");
      console.error("1. Check your API key in .env.local");
      console.error("2. Make sure it starts with: sk-ant-api03-");
      console.error("3. No extra spaces or quotes");
      console.error("4. Get a new key from: https://console.anthropic.com/settings/keys");
    } else if (error.message?.includes("credit")) {
      console.error("Error: Insufficient credits");
      console.error("\nAdd payment method at:");
      console.error("https://console.anthropic.com/settings/billing");
    } else {
      console.error("Error:", error.message);
    }
    
    process.exit(1);
  }
}

test();
