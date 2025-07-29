import { useHits, useSearch, useSearchSlots } from '@/hooks';
import { Typography, type GridProps } from '@mui/material';
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

type CtxHitWrapperProps = Partial<GridProps>;

function CtxHitWrapper({ children, ...overrides }: CtxHitWrapperProps) {
  // { children?: ReactNode }
  const [slots, slotProps] = useSearchSlots();

  return slots.hitWrapper ? (
    <slots.hitWrapper {...slotProps.hitWrapper} {...overrides}>
      {/* {props?.children} */}
      {children}
    </slots.hitWrapper>
  ) : (
    <Fragment>{children}</Fragment>
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

type CtxHitProps = {
  children?: ReactNode;
  hitWrapperProps?: Partial<GridProps>;
};

function CtxHit({ children, hitWrapperProps }: CtxHitProps) {
  const hits = useHits();
  const [slots, slotProps] = useSearchSlots();

  return slots?.hit ? (
    <>
      {hits?.hits?.map((hit, i) => (
        <CtxHitWrapper
          key={`hit-${hit.document.id}-${i}-wrapper`}
          {...hitWrapperProps}
        >
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
            {children}
          </slots.hit>
        </CtxHitWrapper>
      ))}
    </>
  ) : null;
}

CtxHits.Hit = CtxHit;

interface ContextHitsProps {
  hitWrapperProps?: CtxHitWrapperProps;
}

export function ContextHits({ hitWrapperProps }: ContextHitsProps) {
  return (
    <CtxHits>
      <CtxHits.Hit hitWrapperProps={hitWrapperProps} />
    </CtxHits>
  );
}
