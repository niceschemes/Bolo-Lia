import Image, { type ImageProps } from "next/image";
import { isExternalImage } from "@/lib/constants";

type RemoteImageProps = Omit<ImageProps, "unoptimized"> & {
  src: string;
};

/** Imagens externas sem otimizador do Next (evita quebra quando CDN falha no servidor). */
export function RemoteImage({ src, alt, className, ...props }: RemoteImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      unoptimized={isExternalImage(src)}
      {...props}
    />
  );
}
