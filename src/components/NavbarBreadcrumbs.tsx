import { NavigateNextRounded } from '@mui/icons-material';
import type { TypographyProps } from '@mui/material';
import {
  Breadcrumbs,
  breadcrumbsClasses,
  styled,
  Typography,
} from '@mui/material';
import type { LinkComponent } from '@tanstack/react-router';
import { createLink, useMatches } from '@tanstack/react-router';
import { forwardRef } from 'react';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

interface MUILinkProps extends Omit<TypographyProps, 'href'> {
  // Add any additional props you want to pass to the button
}

const MUILinkComponent = forwardRef<HTMLAnchorElement, MUILinkProps>(
  (props, ref) => {
    return (
      <Typography
        component={'a'}
        ref={ref}
        color='inherit'
        underline='none'
        style={{ textDecoration: 'none' }}
        {...props}
      />
    );
  }
);

const CreatedLinkComponent = createLink(MUILinkComponent);

export const CustomLink: LinkComponent<typeof MUILinkComponent> = (props) => {
  return <CreatedLinkComponent preload={'intent'} {...props} />;
};

const NavbarBreadcrumbs = () => {
  // const router = useRouter();
  // const routerState = useRouterState();
  const matches = useMatches();

  // let allPaths = Object.keys(router.routesByPath);

  // const breadcrumbs: Record<string, string>[] = matches
  //   // .filter((match) => match.staticData.crumb)
  //   .map(({ pathname, staticData, ...rest }) => {
  //     let test = rest.fullPath.split('/').filter((x) => x);

  //     if (test.length) {
  //       let reduceResult = test.reduce<Record<string, string>>(
  //         (acc, cur, i, arr) => {
  //           let pathIsValid = allPaths.includes(
  //             '/' + arr.slice(0, i + 1).join('/')
  //           );
  //           console.log(
  //             'PATH IS VALID: ',
  //             pathIsValid,
  //             '/' + arr.slice(0, i + 1).join('/')
  //           );

  //           let path = arr.slice(0, i + 1).map((k) => {
  //             if (k.startsWith('$')) {
  //               // @ts-ignore
  //               console.log(`PARAM ${k}: ${rest.params[k.slice(1)]}`);
  //               // @ts-ignore
  //               return rest.params[k.slice(1)] || '';
  //             } else return k;
  //           });

  //           console.log('PATH: ', path);
  //           // @ts-ignore
  //           let key = cur.startsWith('$') ? rest.params[cur.slice(1)] : cur;
  //           if (key && path.every((val) => val))
  //             return { ...acc, [key]: '/' + path.join('/') };
  //           else return acc;
  //         },
  //         {}
  //       );
  //       return reduceResult;
  //     }
  //   })
  //   .filter((x) => x) as Record<string, string>[];

  const breadcrumbs = matches
    .filter((match) => match.staticData.crumb)
    .map(({ pathname, staticData }) => ({
      title: staticData.crumb,
      path: pathname,
    }));

  return (
    <StyledBreadcrumbs
      aria-label='breadcrumb'
      separator={<NavigateNextRounded fontSize='small' />}
    >
      {/* {Boolean(breadcrumbs.length)
        ? Object.entries(breadcrumbs[0]).map(([title, path]) => (
            // @ts-ignore
            <CustomLink key={path} to={path} variant='body1'>
              {title}
            </CustomLink>
          ))
        : null} */}
      {breadcrumbs.map((breadcrumb) => (
        <CustomLink key={breadcrumb.path} to={breadcrumb.path} variant='body1'>
          {breadcrumb.title}
        </CustomLink>
      ))}
    </StyledBreadcrumbs>
  );
};
export default NavbarBreadcrumbs;
