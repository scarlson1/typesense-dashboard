import { ExpandMoreRounded } from '@mui/icons-material';
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Collapse,
  IconButton,
  Stack,
  styled,
  Typography,
  type IconButtonProps,
  type TypographyProps,
} from '@mui/material';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type {
  DocumentSchema,
  SearchResponseHit,
} from 'typesense/lib/Typesense/Documents';
import { HitActions } from './HitActions';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme }) => ({
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
  variants: [
    {
      props: ({ expand }) => !expand,
      style: {
        transform: 'rotate(0deg)',
      },
    },
    {
      props: ({ expand }) => !!expand,
      style: {
        transform: 'rotate(180deg)',
      },
    },
  ],
}));

export interface HitProps {
  hit: SearchResponseHit<DocumentSchema>;
  children?: ReactNode;
  displayFields?: string[];
  imgField?: string | null;
}

export function Hit({ hit, children, displayFields, imgField }: HitProps) {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  let displayFieldsArr = useMemo(() => {
    if (!displayFields?.length) return Object.entries(hit?.document);

    return Object.entries(hit?.document).filter(([field]) =>
      displayFields.includes(field)
    );
  }, [displayFields, hit]);

  return (
    <Card
      sx={{
        position: 'relative',
      }}
    >
      {imgField ? (
        <CardMedia
          component='img'
          sx={{
            height: { xs: 100, md: 120 },
            // objectFit: 'cover',
            // backgroundSize: 'cover',
          }}
          image={imgField}
          title='hit image'
        />
      ) : null}
      <CardContent sx={{ pb: 2 }}>
        <Stack direction='row' spacing={3} sx={{ display: 'flex', pb: 1.5 }}>
          <HitLabel>ID</HitLabel>
          <HitValue> {hit?.document.id}</HitValue>
        </Stack>
        <Stack
          direction='column'
          spacing={0.75}
          sx={{ maxHeight: 300, overflowX: 'auto' }}
        >
          {displayFieldsArr.map(([key, value]) => (
            <Stack
              direction='row'
              spacing={3}
              key={key}
              sx={{ display: 'flex' }}
            >
              <HitLabel>{key}</HitLabel>
              <HitValue>
                {typeof value === 'string' || typeof value === 'number'
                  ? value
                  : JSON.stringify(value)}
              </HitValue>
            </Stack>
          ))}
        </Stack>
      </CardContent>
      <CardActions
        disableSpacing
        sx={{ borderTop: (theme) => `1px solid ${theme.palette.divider}` }}
      >
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label='show stats'
          size='small'
        >
          <ExpandMoreRounded fontSize='inherit' />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout='auto' unmountOnExit>
        <CardContent>
          <HitLabel
            variant='overline'
            component='div'
            sx={{ textAlign: 'center' }}
          >
            text_match_info
          </HitLabel>
          {Object.entries(hit?.text_match_info as Record<string, any>).map(
            ([key, value], i) => (
              <Stack
                direction='row'
                spacing={3}
                key={key}
                sx={{ display: 'flex', mt: i === 0 ? 2 : 0 }}
              >
                <HitLabel>{key}</HitLabel>
                <HitValue>
                  {typeof value === 'string' || typeof value === 'number'
                    ? value
                    : JSON.stringify(value)}
                </HitValue>
              </Stack>
            )
          )}
        </CardContent>
      </Collapse>

      <HitActions docId={hit.document.id} docData={hit.document} />
      {children}
    </Card>
  );
}

function HitLabel({ children, ...props }: TypographyProps) {
  return (
    <Typography
      variant='body2'
      color='textSecondary'
      sx={{
        textAlign: 'right',
        // width: { xs: 120, sm: 150, md: 200 },
        width: '25%',
        flex: '0 0 auto',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
      {...props}
    >
      {children}
    </Typography>
  );
}

function HitValue({ children, ...props }: TypographyProps) {
  return (
    <Typography
      variant='body2'
      {...props}
      sx={{
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        ...(props?.sx || {}),
      }}
    >
      {children}
    </Typography>
  );
}

// export function Hit({ hit, children, displayFields, imgField }: HitProps) {
//   let displayFieldsArr = useMemo(() => {
//     if (!displayFields?.length) return Object.entries(hit?.document);

//     return Object.entries(hit?.document).filter(([field]) =>
//       displayFields.includes(field)
//     );
//   }, [displayFields, hit]);

//   return (
//     <Paper
//       sx={{
//         p: { xs: 3, sm: 4, md: 5 },
//         position: 'relative',
//       }}
//     >
//       {imgField ? (
//         // <img
//         //   src={imgField}
//         //   style={{ borderRadius: '10px', objectFit: 'cover' }}
//         //   height={100}
//         //   width={100}
//         // />
//         <CardMedia
//           component='img'
//           sx={{ height: 100, objectFit: 'cover', backgroundSize: 'cover' }}
//           image={imgField}
//           title='green iguana'
//         />
//       ) : null}
//       <Stack
//         direction='column'
//         spacing={1}
//         sx={{ maxHeight: 300, overflowX: 'auto' }}
//       >
//         {displayFieldsArr.map(([key, value]) => (
//           <Stack direction='row' spacing={3} key={key} sx={{ display: 'flex' }}>
//             <HitLabel>{key}</HitLabel>
//             <Typography
//               variant='body2'
//               sx={{
//                 textOverflow: 'ellipsis',
//                 overflow: 'hidden',
//                 whiteSpace: 'nowrap',
//               }}
//             >
//               {typeof value === 'string' || typeof value === 'number'
//                 ? value
//                 : JSON.stringify(value)}
//             </Typography>
//           </Stack>
//         ))}
//         <HitLabel variant='overline'>text_match_info</HitLabel>
//         {Object.entries(hit?.text_match_info as Record<string, any>).map(
//           ([key, value], i) => (
//             <Stack
//               direction='row'
//               spacing={3}
//               key={key}
//               sx={{ display: 'flex', mt: i === 0 ? 2 : 0 }}
//             >
//               <HitLabel>{key}</HitLabel>
//               <Typography
//                 variant='body2'
//                 sx={{
//                   textOverflow: 'ellipsis',
//                   overflow: 'hidden',
//                   whiteSpace: 'nowrap',
//                 }}
//               >
//                 {typeof value === 'string' || typeof value === 'number'
//                   ? value
//                   : JSON.stringify(value)}
//               </Typography>
//             </Stack>
//           )
//         )}
//         <Stack direction='row' spacing={3} sx={{ display: 'flex', mt: 2 }}>
//           <HitLabel>ID</HitLabel>
//           <Typography
//             variant='body2'
//             sx={{
//               textOverflow: 'ellipsis',
//               overflow: 'hidden',
//               whiteSpace: 'nowrap',
//             }}
//           >
//             {hit?.document.id}
//           </Typography>
//         </Stack>
//       </Stack>

//       <HitActions docId={hit.document.id} docData={hit.document} />
//       {children}
//     </Paper>
//   );
// }
