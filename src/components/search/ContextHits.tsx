import { useHits, useSearch, useSearchSlots } from '@/hooks';
import { Typography } from '@mui/material';
import { Fragment, Suspense, type ReactNode } from 'react';

function CtxHits({ children }: { children?: ReactNode }) {
  const { isLoading, isFetching } = useSearch();
  const hits = useHits();
  const [slots, slotProps] = useSearchSlots();

  if (!hits?.hits) {
    if (isLoading || isFetching) {
      return slots.loadingHits ? (
        <slots.loadingHits {...slotProps.loadingHits} />
      ) : null;
    }

    return slots.noHitsFound ? (
      <slots.noHitsFound {...slotProps.noHitsFound}>
        <Typography>Enter a search above</Typography>
      </slots.noHitsFound>
    ) : null;
  }

  let message =
    slotProps?.noHitsFound?.message ||
    `No results for "${hits?.request_params?.q}"`;

  if (!hits?.hits.length) {
    return slots.noHitsFound ? (
      <slots.noHitsFound {...slotProps.noHitsFound}>
        <Typography component='div'>{message}</Typography>
      </slots.noHitsFound>
    ) : null;
  }

  return slots?.hits ? (
    <slots.hits {...slotProps.hits}>{children}</slots.hits>
  ) : null;
}

function CtxHitWrapper(props: { children?: ReactNode }) {
  const [slots, slotProps] = useSearchSlots();

  return slots.hitWrapper ? (
    <slots.hitWrapper {...slotProps.hitWrapper}>
      {props?.children}
    </slots.hitWrapper>
  ) : (
    <Fragment>{props?.children}</Fragment>
  );
}

CtxHits.HitWrapper = CtxHitWrapper;

// need to pass props --> render in CtxHit (or could pass render fn prop ??)

// function CtxHitActions({docData, docId, ...props}: HitActionsProps) {
//   const [slots, slotProps] = useSearchSlots();

//   return slots?.hitActions ? (
//     <slots.hitActions docData={docData} docId={docId} {...props} {...slotProps?.hitActions || {}} />
//   ) : null;
// }
// CtxHits.HitActions = CtxHitActions

function CtxHit(props: { children?: ReactNode }) {
  const hits = useHits();
  const [slots, slotProps] = useSearchSlots();

  return slots?.hit ? (
    <>
      {hits?.hits?.map((hit, i) => (
        <CtxHitWrapper key={`hit-${hit.document.id}-${i}-wrapper`}>
          <slots.hit
            {...slotProps?.hit}
            hit={hit}
            key={`hit-${hit.document.id}-${i}`}
            imgProps={slotProps?.hitImg || {}}
          >
            {slots?.hitActions ? (
              <Suspense>
                <slots.hitActions
                  docData={hit.document}
                  docId={hit.document.id}
                  {...slotProps?.hitActions}
                />
              </Suspense>
            ) : null}
            {props?.children}
          </slots.hit>
        </CtxHitWrapper>
      ))}
    </>
  ) : null;
}

CtxHits.Hit = CtxHit;

export function ContextHits() {
  return (
    <CtxHits>
      <CtxHits.Hit />
    </CtxHits>
  );
}
