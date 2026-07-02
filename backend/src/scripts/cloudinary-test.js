const cloudinary = require("cloudinary").v2;

// ── 1. Configure Cloudinary (inline credentials) ─────────────────────────────
cloudinary.config({
  cloud_name: "khru10qc",       // ← replace this if needed
  api_key: "139682619826837",   // ← replace this if needed
  api_secret: "6IeptI91BmcNmxoe7-Bui9FxEzI", // ← replace this if needed
});

async function main() {
  // ── 2. Upload a sample image ──────────────────────────────────────────────
  console.log("Uploading image...");
  const uploadResult = await cloudinary.uploader.upload(
    "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    { public_id: "lifeos_onboarding_sample" }
  );

  console.log("\n✅ Upload successful!");
  console.log("   Secure URL :", uploadResult.secure_url);
  console.log("   Public ID  :", uploadResult.public_id);

  // ── 3. Get image details ──────────────────────────────────────────────────
  console.log("\n📋 Image metadata:");
  console.log("   Width      :", uploadResult.width, "px");
  console.log("   Height     :", uploadResult.height, "px");
  console.log("   Format     :", uploadResult.format);
  console.log("   File size  :", uploadResult.bytes, "bytes");

  // ── 4. Transform the image ────────────────────────────────────────────────
  // f_auto → Cloudinary picks the best format for the user's browser (e.g. WebP, AVIF)
  // q_auto → Cloudinary picks the best quality level to reduce file size without visible loss
  const transformedUrl = cloudinary.url(uploadResult.public_id, {
    transformation: [{ fetch_format: "auto", quality: "auto" }],
    secure: true,
  });

  console.log("\n🎉 Done! Click link below to see optimized version of the image. Check the size and the format.");
  console.log("   Transformed URL:", transformedUrl);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
