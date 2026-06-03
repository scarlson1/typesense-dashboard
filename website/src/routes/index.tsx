import { createFileRoute } from '@tanstack/react-router';

import { Features } from '#/components/landing/Features';
import { Footer } from '#/components/landing/Footer';
import { Gallery } from '#/components/landing/Gallery';
import { GetStarted } from '#/components/landing/GetStarted';
import { Hero } from '#/components/landing/Hero';
import { GeoHighlight, SearchHighlight } from '#/components/landing/Highlights';
import { MobileHero } from '#/components/landing/MobileHero';
import { Nav } from '#/components/landing/Nav';
import { OpenSource } from '#/components/landing/OpenSource';
import { TrustStrip } from '#/components/landing/TrustStrip';
import { useReveal } from '#/hooks/useReveal';
import { Box } from '@mui/material';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
  useReveal();

  return (
    <>
      <Nav />
      <main id='top'>
        {/* xs/sm get the dedicated mobile hero; md+ keep the desktop hero. */}
        <MobileHero />
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Hero />
        </Box>
        {/* Sits above the mobile hero's wireframe (zIndex 2) so its opaque
            background covers the wireframe's downward drop shadow instead of
            letting it bleed into this strip — the peek then reads as diving
            cleanly under the section, matching the desktop hero. */}
        <Box sx={{ position: 'relative', zIndex: 3 }}>
          <TrustStrip />
        </Box>
        <Features />
        <SearchHighlight />
        <GeoHighlight />
        <Gallery />
        <OpenSource />
        <GetStarted />
      </main>
      <Footer />
      {/* Reserve space for the fixed mobile CTA bar so it never hides the footer. */}
      <Box
        aria-hidden
        sx={{
          height: { xs: 'calc(92px + env(safe-area-inset-bottom, 0px))', md: 0 },
        }}
      />
    </>
  );
}
