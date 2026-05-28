import { smallButtonSx } from '@/components/redesign';
import { aliasQueryKeys } from '@/constants';
import { useAsyncToast, useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { queryClient } from '@/utils';
import {
  ArrowForwardRounded,
  DeleteOutlineRounded,
  LinkRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import type { CollectionAliasSchema } from 'typesense/lib/Typesense/Aliases';

interface AliasGridProps {
  onRepoint?: (alias: CollectionAliasSchema) => void;
}

export function AliasGrid({ onRepoint }: AliasGridProps) {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();

  const { data } = useSuspenseQuery({
    queryKey: aliasQueryKeys.all(clusterId),
    queryFn: async () => {
      const res = await client.aliases().retrieve();
      return res.aliases || [];
    },
  });

  const mutation = useMutation({
    mutationFn: (name: string) => client.aliases(name).delete(),
    onMutate: (variables) => {
      toast.loading(`deleting alias "${variables}"`, { id: 'delete-alias' });
      const prevAliases: CollectionAliasSchema[] | undefined =
        queryClient.getQueryData(aliasQueryKeys.all(clusterId));

      queryClient.setQueryData(
        aliasQueryKeys.all(clusterId),
        (data: CollectionAliasSchema[]) =>
          data.filter((c) => c.name !== variables),
      );

      return { name: variables, prevAliases };
    },
    onSuccess: (_, __, ctx) => {
      toast.success(`alias "${ctx.name}" deleted`, { id: 'delete-alias' });
    },
    onError(error, _, ctx) {
      const msg = error.message ?? `failed to delete alias "${ctx?.name}"`;
      toast.error(msg, { id: 'delete-alias' });
      queryClient.setQueryData(aliasQueryKeys.all(clusterId), ctx?.prevAliases);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: aliasQueryKeys.all(clusterId),
      });
    },
  });

  if (!data?.length) {
    return (
      <Box sx={{ px: 1.75, py: 3, textAlign: 'center' }}>
        <Typography sx={{ fontSize: 13, color: designTokens.textMuted }}>
          No aliases yet. Create one below.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Mobile card list */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {data.map((alias, i) => (
          <Box
            key={alias.name}
            sx={{
              px: 2,
              py: 1.625,
              borderTop: i === 0 ? 'none' : `1px solid ${designTokens.border}`,
            }}
          >
            <Stack
              direction='row'
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Stack
                direction='row'
                spacing={0.75}
                sx={{ alignItems: 'center' }}
              >
                <LinkRounded
                  sx={{ fontSize: 14, color: designTokens.accent }}
                />
                <Typography
                  sx={{
                    fontFamily: designTokens.fontMono,
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: designTokens.text,
                  }}
                >
                  {alias.name}
                </Typography>
              </Stack>
              <Stack
                direction='row'
                spacing={0.5}
                sx={{ alignItems: 'center' }}
              >
                {onRepoint ? (
                  <Button
                    size='small'
                    variant='outlined'
                    onClick={() => onRepoint(alias)}
                    sx={{
                      ...smallButtonSx,
                      height: 26,
                      fontSize: 11.5,
                      px: 1,
                      minWidth: 'auto',
                    }}
                  >
                    Re-point
                  </Button>
                ) : null}
                <Tooltip title='Delete alias'>
                  <IconButton
                    size='small'
                    onClick={() => mutation.mutate(alias.name)}
                    disabled={mutation.isPending}
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: '5px',
                      color: designTokens.textFaint,
                      '&:hover': {
                        color: designTokens.danger,
                        background: designTokens.dangerSoft,
                      },
                    }}
                  >
                    <DeleteOutlineRounded sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
            <Stack
              direction='row'
              spacing={0.75}
              sx={{ mt: 0.5, pl: 0.125, alignItems: 'center' }}
            >
              <ArrowForwardRounded
                sx={{ fontSize: 13, color: designTokens.textFaint }}
              />
              <Typography
                sx={{
                  fontFamily: designTokens.fontMono,
                  fontSize: 12.5,
                  color: designTokens.textMuted,
                }}
              >
                {alias.collection_name}
              </Typography>
            </Stack>
          </Box>
        ))}
      </Box>

      {/* Desktop table */}
      <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
        <Table size='small' sx={{ tableLayout: 'auto' }}>
          <TableHead>
            <TableRow
              sx={{
                background: designTokens.surfaceTinted,
                '& th': {
                  textAlign: 'left',
                  px: 1.75,
                  py: 1.25,
                  fontSize: 11,
                  color: designTokens.textFaint,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  border: 'none',
                  borderBottom: `1px solid ${designTokens.border}`,
                },
              }}
            >
              <TableCell>Alias</TableCell>
              <TableCell>Points to</TableCell>
              <TableCell sx={{ width: 80 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((alias, i) => (
              <TableRow
                key={alias.name}
                sx={{
                  '& td': {
                    px: 1.75,
                    py: 1.5,
                    border: 'none',
                    borderTop:
                      i === 0 ? 'none' : `1px solid ${designTokens.border}`,
                  },
                  '&:hover': {
                    background: designTokens.surfaceMuted,
                  },
                }}
              >
                <TableCell>
                  <Stack
                    direction='row'
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <LinkRounded
                      sx={{ fontSize: 14, color: designTokens.accent }}
                    />
                    <Typography
                      sx={{
                        fontFamily: designTokens.fontMono,
                        fontSize: 13,
                        color: designTokens.text,
                        fontWeight: 500,
                      }}
                    >
                      {alias.name}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack
                    direction='row'
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <ArrowForwardRounded
                      sx={{ fontSize: 13, color: designTokens.textFaint }}
                    />
                    <Box
                      component='span'
                      sx={{
                        fontFamily: designTokens.fontMono,
                        fontSize: 12.5,
                        px: 1,
                        py: '2px',
                        background: designTokens.surfaceMuted,
                        border: `1px solid ${designTokens.border}`,
                        borderRadius: '4px',
                        color: designTokens.text,
                      }}
                    >
                      {alias.collection_name}
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  <Stack
                    direction='row'
                    spacing={0.5}
                    sx={{ justifyContent: 'flex-end', alignItems: 'center' }}
                  >
                    {onRepoint ? (
                      <Button
                        size='small'
                        variant='outlined'
                        onClick={() => onRepoint(alias)}
                        sx={{
                          ...smallButtonSx,
                          height: 28,
                          fontSize: 12,
                          px: 1.25,
                          minWidth: 'auto',
                        }}
                      >
                        Re-point
                      </Button>
                    ) : null}
                    <Tooltip title='Delete alias'>
                      <IconButton
                        size='small'
                        onClick={() => mutation.mutate(alias.name)}
                        disabled={mutation.isPending}
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: '5px',
                          color: designTokens.textFaint,
                          '&:hover': {
                            color: designTokens.danger,
                            background: designTokens.dangerSoft,
                          },
                        }}
                      >
                        <DeleteOutlineRounded sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
