import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// UploadThing reads UPLOADTHING_TOKEN from process.env automatically.
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
