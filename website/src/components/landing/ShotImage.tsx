import type { ShotName } from './shots.gen';
import { shots } from './shots.gen';

interface ShotImageProps {
  name: ShotName;
  alt: string;
  /**
   * CSS width the image paints into, per breakpoint. Drives which srcSet
   * candidate the browser downloads, so it has to track the real layout —
   * see the callers for the box math.
   */
  sizes: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * Renders a landing-page screenshot as a responsive AVIF/WebP `<picture>`.
 *
 * The intrinsic width/height come from the generated manifest so the aspect
 * box is reserved before the bytes land (no CLS), and stay correct if the
 * source screenshots are ever re-exported at a different size.
 */
/**
 * `.split-media` sits in a 1fr/1fr `.split` grid inside `.wrap`
 * (max-width 1180px, 28px inline padding) with a `clamp(36px, 6vw, 80px)`
 * gutter, and collapses to one full-width column at 840px.
 */
export const SPLIT_MEDIA_SIZES =
  '(max-width: 840px) calc(100vw - 56px),' +
  ' (max-width: 1180px) calc((94vw - 56px) / 2),' +
  ' 530px';

export const ShotImage = ({
  name,
  alt,
  sizes,
  className,
  loading = 'lazy',
}: ShotImageProps) => {
  const shot = shots[name];

  return (
    <picture className={className}>
      <source type='image/avif' srcSet={shot.avifSrcSet} sizes={sizes} />
      <img
        src={shot.src}
        srcSet={shot.webpSrcSet}
        sizes={sizes}
        width={shot.width}
        height={shot.height}
        alt={alt}
        loading={loading}
        decoding='async'
      />
    </picture>
  );
};
