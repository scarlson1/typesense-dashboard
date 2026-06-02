// import { GithubIcon } from '#/components/icons';
import { DEMO_URL, REPO_URL } from '#/components/landing/links';
import { Logo } from '#/components/Logo';
import { ThemeModeToggle } from '#/components/ThemeModeToggle';
import { useScrolled } from '#/hooks/useScrolled';
import { GitHub } from '@mui/icons-material';
import { Box, Button, Container } from '@mui/material';

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
            Typesense Dashboard <small>· OSS</small>
          </span>
        </a>
        <nav className='nav-links'>
          <a href='#features'>Features</a>
          <a href='#search'>Search</a>
          <a href='#gallery'>Screenshots</a>
          {/* <a href='#open-source'>Open source</a> */}
          <a href='#start'>Get started</a>
        </nav>
        <div className='nav-actions'>
          {/* <button
            className='theme-toggle'
            onClick={toggle}
            aria-label='Toggle color theme'
          >
            <SunIcon />
            <MoonIcon />
          </button> */}
          <Box>
            <ThemeModeToggle />
          </Box>
          <Button
            // className='btn btn-ghost btn-sm'
            size='small'
            variant='outlined'
            color='inherit'
            href={REPO_URL}
            target='_blank'
            rel='noopener'
            startIcon={<GitHub fontSize='inherit' />}
            sx={{ borderColor: (theme) => theme.palette.design.borderStrong }}
          >
            {/* <GithubIcon /> */}
            GitHub
          </Button>
          <Button
            // className='btn btn-primary btn-sm'
            variant='contained'
            size='small'
            href={DEMO_URL}
            target='_blank'
            rel='noopener'
          >
            Live demo
          </Button>
        </div>
      </Container>
    </header>
  );
};
