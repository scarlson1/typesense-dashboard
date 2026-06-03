// import { GithubIcon } from '#/components/icons';
import { DEMO_URL, REPO_URL } from '#/components/landing/links';
import { Logo } from '#/components/Logo';
import { ThemeModeToggle } from '#/components/ThemeModeToggle';
import { useScrolled } from '#/hooks/useScrolled';
import { GitHub } from '@mui/icons-material';
import { Box, Button, Container, IconButton, Stack } from '@mui/material';

export const Nav = () => {
  const scrolled = useScrolled();
  // const { toggle } = useTheme();

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`} id='nav'>
      <Container
        // className='wrap nav-inner'
        maxWidth='xl'
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: { xs: 48, sm: 56 },
          // paddingInline: 28,
        }}
      >
        <Stack
          component='a'
          direction='row'
          spacing={{ xs: 0.5, sm: 1 }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '11px',
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: '-0.01em',
          }}
          href='#top'
        >
          <Box
            component='span'
            sx={{
              width: { xs: 24, sm: 30 },
              height: { xs: 24, sm: 30 },
              borderRadius: 1,
              flex: 'none',
              background:
                'linear-gradient(160deg, var(--mui-palette-design-accentHover), var(--mui-palette-design-accent))',
              display: 'grid',
              placeItems: 'center',
              color: '#FFF',
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: '-0.01em',
              '& svg': {
                width: '62%',
                height: '62%',
              },
            }}
          >
            <Logo />
          </Box>
          <span>
            Typesense Dashboard{' '}
            <Box
              component='small'
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              · OSS
            </Box>
          </span>
        </Stack>

        <Stack
          direction='row'
          spacing={1}
          sx={{ ml: 'auto', display: { xs: 'none', lg: 'flex' } }}
        >
          <Button href='#features' color='inherit' size='small'>
            Features
          </Button>
          <Button href='#search' color='inherit' size='small'>
            Search
          </Button>
          <Button href='#gallery' color='inherit' size='small'>
            Screenshots
          </Button>
          <Button href='#start' color='inherit' size='small'>
            Get started
          </Button>
        </Stack>

        <Stack
          direction='row'
          spacing={1}
          sx={{
            alignItems: 'center',
            ml: 'auto',
          }}
        >
          <Button
            // className='btn btn-ghost btn-sm'
            size='small'
            variant='outlined'
            color='inherit'
            href={REPO_URL}
            target='_blank'
            rel='noopener'
            startIcon={<GitHub fontSize='inherit' />}
            sx={{
              borderColor: (theme) => theme.palette.design.border,
              display: { xs: 'none', md: 'inline-flex' },
            }}
          >
            {/* <GithubIcon /> */}
            GitHub
          </Button>
          <IconButton
            href={REPO_URL}
            target='_blank'
            rel='noopener'
            aria-label='Github'
            size='small'
            disableRipple
            variant='square'
            sx={{
              display: {
                xs: 'inline-flex',
                sm: 'none',
                md: 'none',
                lg: 'none',
                xl: 'none',
              },
            }}
          >
            <GitHub fontSize='inherit' />
          </IconButton>
          <Button
            // className='btn btn-primary btn-sm'
            variant='contained'
            size='small'
            href={DEMO_URL}
            target='_blank'
            rel='noopener'
            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
          >
            Live demo
          </Button>

          <Box>
            <ThemeModeToggle />
          </Box>
        </Stack>
      </Container>
    </header>
  );
};
