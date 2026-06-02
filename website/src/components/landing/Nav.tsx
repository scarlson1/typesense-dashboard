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
          height: 56,
          // paddingInline: 28,
        }}
      >
        <a className='brand' href='#top'>
          <span className='logo'>
            <Logo />
          </span>
          <span>
            Typesense Dashboard{' '}
            <Box
              component='small'
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              · OSS
            </Box>
          </span>
        </a>
        {/* <nav className='nav-links'>
          <a href='#features'>Features</a>
          <a href='#search'>Search</a>
          <a href='#gallery'>Screenshots</a>
          <a href='#start'>Get started</a>
        </nav> */}
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
              display: { xs: 'none', sm: 'inline-flex' },
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
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
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
