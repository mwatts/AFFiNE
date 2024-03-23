import { useAsyncCallback } from '@affine/core/hooks/affine-async-hooks';
import {
  SubscriptionPlan,
  type SubscriptionQuery,
  subscriptionQuery,
} from '@affine/graphql';

import { useServerFeatures } from './affine/use-server-config';
import { useQuery } from './use-query';

export type Subscription = NonNullable<
  NonNullable<SubscriptionQuery['currentUser']>['subscriptions'][number]
>;

export type SubscriptionMutator = (update?: Partial<Subscription>) => void;

const selector = (data: SubscriptionQuery, plan: SubscriptionPlan) =>
  (data.currentUser?.subscriptions ?? []).find(p => p.plan === plan);

export const useUserSubscription = (
  plan: SubscriptionPlan = SubscriptionPlan.Pro
) => {
  const { payment: hasPaymentFeature } = useServerFeatures();
  const { data, mutate } = useQuery(
    hasPaymentFeature ? { query: subscriptionQuery } : undefined
  );

  const set: SubscriptionMutator = useAsyncCallback(
    async (update?: Partial<Subscription>) => {
      await mutate(prev => {
        if (!update || !prev?.currentUser?.subscriptions) {
          return;
        }

        let hit = false;
        return {
          currentUser: {
            subscriptions: (prev.currentUser?.subscriptions ?? []).map(sub => {
              if (!hit || sub.plan !== plan) {
                return sub;
              }
              hit = true;
              return {
                ...sub,
                ...update,
              };
            }),
          },
        };
      });
    },
    [mutate, plan]
  );

  if (!hasPaymentFeature) {
    return [null, () => {}] as const;
  }

  return [selector(data, plan), set] as const;
};
