import {
  DEMO_URL_NO_CREDS,
  RELEASES_URL,
  REPO_URL,
  TYPESENSE_DOCS_URL,
  TYPESENSE_URL,
} from '#/components/landing/links';
import { Logo } from '#/components/Logo';
import TypesenseLogo from '#/components/TypesenseLogo';
import { GitHub } from '@mui/icons-material';
import { Box, IconButton, Stack } from '@mui/material';

export const Footer = () => (
  <footer className='footer'>
    <Box className='wrap'>
      <Box className='foot-grid'>
        <div className='foot-brand'>
          <a className='brand' href='#top'>
            <span className='logo'>
              <Logo />
            </span>{' '}
            <span>Typesense Dashboard</span>
          </a>
          <p>
            An open-source dashboard to manage self-hosted and local Typesense
            instances. Built by the community, MIT licensed.
          </p>

          <Stack direction='row' spacing={1} sx={{ mt: 2 }}>
            <IconButton
              href={REPO_URL}
              target='_blank'
              rel='noopener'
              aria-label='Github'
              size='small'
              disableRipple
              variant='square'
              // sx={{
              //   color: (theme) => theme.vars.palette.design.textMuted,
              //   borderRadius: 1,
              //   padding: 1,
              //   border: '1px solid',
              //   borderColor: (theme) => theme.vars.palette.design.border,
              //   transition: 'all 0.2s ease-in-out',
              //   '&:hover': {
              //     color: 'text.primary',
              //     borderColor: (theme) =>
              //       theme.vars.palette.design.borderStrong,
              //     // transform: 'scale(1.1)',
              //   },
              // }}
            >
              <GitHub fontSize='inherit' />
            </IconButton>
            <IconButton
              href={TYPESENSE_URL}
              target='_blank'
              rel='noopener'
              aria-label='Typesense'
              size='small'
              disableRipple
              variant='square'
              // sx={{
              //   color: (theme) => theme.vars.palette.design.textMuted,
              //   borderRadius: 1,
              //   padding: 1,
              //   border: '1px solid',
              //   borderColor: (theme) => theme.vars.palette.design.border,
              //   transition: 'all 0.2s ease-in-out',
              //   '&:hover': {
              //     color: 'text.primary',
              //     borderColor: (theme) =>
              //       theme.vars.palette.design.borderStrong,
              //     // transform: 'scale(1.1)',
              //   },
              // }}
            >
              <TypesenseLogo fontSize='inherit' />
            </IconButton>
          </Stack>
        </div>
        <Box className='foot-col'>
          <h5>Product</h5>
          <a href='#features'>Features</a>
          <a href='#search'>Search</a>
          <a href='#gallery'>Screenshots</a>
          <a href='#open-source'>Open source</a>
        </Box>
        <Box className='foot-col' sx={{ display: { xs: 'none', md: 'block' } }}>
          <h5>Resources</h5>
          <a href={REPO_URL} target='_blank' rel='noopener'>
            GitHub repo
          </a>
          <a href={RELEASES_URL} target='_blank' rel='noopener'>
            Download
          </a>
          <a href={TYPESENSE_DOCS_URL} target='_blank' rel='noopener'>
            Typesense docs
          </a>
          {/* <a href='#start'>Get started</a> */}
        </Box>
        <Box className='foot-col'>
          <h5>Deploy</h5>
          <a href={DEMO_URL_NO_CREDS} target='_blank' rel='noopener'>
            Hosted
          </a>
          <a href={REPO_URL} target='_blank' rel='noopener'>
            Docker
          </a>
          <a href={REPO_URL} target='_blank' rel='noopener'>
            Vercel · Netlify
          </a>
          {/* <a href={REPO_URL} target='_blank' rel='noopener'>
            Railway
          </a> */}
          {/* <a href={RELEASES_URL} target='_blank' rel='noopener'>
            Desktop app
          </a> */}
        </Box>
      </Box>
      <div className='foot-bottom'>
        <span>© 2026 Typesense Dashboard contributors · MIT License</span>
        <span className='disc'>
          An independent open-source project. Not affiliated with or endorsed by
          typesense.org.
        </span>
      </div>
    </Box>
  </footer>
);
