import { Stack } from '@mui/material';

export const TrustStrip = () => (
  <section className='strip'>
    <Stack
      direction='row'
      spacing={{ xs: 3, sm: 4 }}
      sx={{ py: 3, justifyContent: 'center', mx: 2 }}
    >
      <Stack
        direction='row'
        spacing={0.5}
        sx={{ fontSize: { xs: 12, sm: 13 } }}
        className='strip-item'
      >
        <svg
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth={2}
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M12 2 4 5v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V5z' />
        </svg>{' '}
        Keys stay in your browser
      </Stack>
      <Stack
        direction='row'
        spacing={0.5}
        sx={{ fontSize: { xs: 12, sm: 13 } }}
        className='strip-item'
      >
        <svg
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth={2}
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <circle cx='12' cy='12' r='10' />
          <path d='M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20' />
        </svg>{' '}
        100% client-side SPA
      </Stack>
      <Stack
        direction='row'
        spacing={0.5}
        sx={{
          fontSize: { xs: 12, sm: 13 },
          display: { xs: 'none', md: 'flex' },
        }}
        className='strip-item'
      >
        <svg
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth={2}
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <polyline points='4 17 10 11 4 5' />
          <line x1='12' y1='19' x2='20' y2='19' />
        </svg>{' '}
        Docker · Vercel · Netlify · Railway
      </Stack>
      <Stack
        direction='row'
        spacing={0.5}
        sx={{
          fontSize: { xs: 12, sm: 13 },
          display: { xs: 'none', lg: 'flex' },
        }}
        className='strip-item'
      >
        <svg
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth={2}
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <rect x='2' y='3' width='20' height='14' rx='2' />
          <line x1='8' y1='21' x2='16' y2='21' />
          <line x1='12' y1='17' x2='12' y2='21' />
        </svg>{' '}
        Native desktop app
      </Stack>
    </Stack>
  </section>
);

// export const TrustStrip = () => (
//   <section className="strip">
//     <div className="wrap strip-inner">
//       <span className="strip-item">
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
//           <path d="M12 2 4 5v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V5z" />
//         </svg>{' '}
//         Keys stay in your browser
//       </span>
//       <span className="strip-item">
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
//           <circle cx="12" cy="12" r="10" />
//           <path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20" />
//         </svg>{' '}
//         100% client-side SPA
//       </span>
//       <span className="strip-item">
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
//           <polyline points="4 17 10 11 4 5" />
//           <line x1="12" y1="19" x2="20" y2="19" />
//         </svg>{' '}
//         Docker · Vercel · Netlify · Railway
//       </span>
//       <span className="strip-item">
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
//           <rect x="2" y="3" width="20" height="14" rx="2" />
//           <line x1="8" y1="21" x2="16" y2="21" />
//           <line x1="12" y1="17" x2="12" y2="21" />
//         </svg>{' '}
//         Native desktop app
//       </span>
//     </div>
//   </section>
// )
