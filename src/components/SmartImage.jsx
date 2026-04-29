import Image from "next/image";
import { cloudinaryLoader, isCloudinaryAssetUrl } from "@/lib/client/cloudinary";

export default function SmartImage({ src, loader, unoptimized, ...props }) {
  const useCloudinary = typeof src === "string" && isCloudinaryAssetUrl(src);
  if (useCloudinary) {
    return <Image {...props} src={src} loader={cloudinaryLoader} unoptimized />;
  }
  return <Image {...props} src={src} loader={loader} unoptimized={unoptimized} />;
}

