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
  const matches = useMatches();

  const breadcrumbs = matches
    .filter((match) => match.staticData.crumb)
    .map(({ pathname, staticData }) => {
      return {
        title: staticData.crumb,
        path: pathname,
      };
    });

  // You can now render the breadcrumbs as needed
  return (
    <StyledBreadcrumbs
      aria-label='breadcrumb'
      separator={<NavigateNextRounded fontSize='small' />}
    >
      {breadcrumbs.map((breadcrumb) => (
        <CustomLink key={breadcrumb.path} to={breadcrumb.path} variant='body1'>
          {breadcrumb.title}
        </CustomLink>
      ))}
    </StyledBreadcrumbs>
  );
};
export default NavbarBreadcrumbs;
