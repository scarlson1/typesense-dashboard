import { createFileRoute } from '@tanstack/react-router';

import { Features } from '#/components/landing/Features';
import { Footer } from '#/components/landing/Footer';
import { Gallery } from '#/components/landing/Gallery';
import { GetStarted } from '#/components/landing/GetStarted';
import { Hero } from '#/components/landing/Hero';
import { GeoHighlight, SearchHighlight } from '#/components/landing/Highlights';
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
        <Hero />
        <Box sx={{ mt: { xs: 4, sm: 5, md: 6, lg: 8 } }}>
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
    </>
  );
}
