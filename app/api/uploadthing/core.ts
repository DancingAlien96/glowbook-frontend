import { z } from "zod";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

/**
 * Payment receipt uploader for the public booking flow.
 *
 * Auth model: the route itself is public (clients have not registered) but the
 * client must pass `appointmentId` as input. The backend later rejects the URL
 * if the appointment doesn't exist when the booking flow POSTs the receipt URL
 * to /api/public/payments/:appointmentId/receipt.
 */
export const ourFileRouter = {
  receiptUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .input(z.object({ appointmentId: z.string().min(10).max(64) }))
    .middleware(async ({ input }) => {
      if (!input.appointmentId) throw new UploadThingError("Missing appointmentId");
      return { appointmentId: input.appointmentId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        appointmentId: metadata.appointmentId,
        url: file.ufsUrl,
        name: file.name,
        size: file.size,
        key: file.key,
      };
    }),

  /**
   * Cover image for the salon's public page. Wider format, larger size.
   * Auth note: anyone with a UPLOADTHING_TOKEN-bearing UI can upload to the bucket,
   * but the URL only matters when the owner saves it via the authenticated
   * PATCH /api/salon/me endpoint. Wasted uploads = trivial bandwidth cost; no
   * security impact.
   */
  coverUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async () => ({}))
    .onUploadComplete(async ({ file }) => ({
      url: file.ufsUrl,
      name: file.name,
      size: file.size,
      key: file.key,
    })),

  /**
   * Subscription receipts — salon owners pay the platform fee by transfer
   * and upload the comprobante here. The URL is then registered with the
   * authenticated POST /api/subscription/me/receipts endpoint.
   */
  subscriptionReceiptUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => ({}))
    .onUploadComplete(async ({ file }) => ({
      url: file.ufsUrl,
      name: file.name,
      size: file.size,
      key: file.key,
    })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
