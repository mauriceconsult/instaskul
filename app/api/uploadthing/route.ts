import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "@/lib/server/uploadthing";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  // Optional: config for callback URL, etc. (Vercel auto-detects in most cases)
});