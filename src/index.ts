import * as ApolloReactCommon from '@apollo/react-common';
import {
  BaseSubscriptionOptions,
  ExecutionResult,
  MutationResult,
  OperationVariables
} from '@apollo/react-common';
import * as ApolloReactHooks from '@apollo/react-hooks';
import * as offline from './offline';
import {DocumentNode} from 'graphql';

export * from './const';
export * from '@apollo/react-hooks';

export type OfflineOptions<TData> = offline.OfflineOptions<TData>;
export const setOfflineConfig = offline.setConfig;
export const updateApolloCache = offline.updateCache;

export type MutationHookOptions<TData, TVariables> = ApolloReactHooks.MutationHookOptions<
  TData,
  TVariables
> &
  OfflineOptions<TData>;

export type MutationFunctionOptions<TData, TVariables> = ApolloReactCommon.MutationFunctionOptions<
  TData,
  TVariables
> &
  OfflineOptions<TData>;

export type MutationTuple<TData, TVariables> = [
  (options?: MutationFunctionOptions<TData, TVariables>) => Promise<ExecutionResult<TData>>,
  MutationResult<TData>
];

export interface SubscriptionHookOptions<TData = any, TVariables = OperationVariables>
  extends BaseSubscriptionOptions<TData, TVariables>,
    OfflineOptions<TData> {
  subscription?: DocumentNode;
}

export const useMutation = <TData = any, TVariables = ApolloReactCommon.OperationVariables>(
  mutation: DocumentNode,
  {
    updateQuery,
    idField,
    operationType,
    mapResultToUpdate,
    ...mutationHookOptions
  }: MutationHookOptions<TData, TVariables> = {}
): MutationTuple<TData, TVariables> => {
  const [mutationFunction, mutationResult] = ApolloReactHooks.useMutation(
    mutation,
    mutationHookOptions
  );
  const enhancedMutationFunction = (
    mutationFunctionOptions?: MutationFunctionOptions<TData, TVariables>
  ) => {
    return mutationFunction(
      offline.getMutationOptions({
        updateQuery,
        idField,
        operationType,
        mapResultToUpdate,
        ...mutationFunctionOptions
      })
    );
  };

  return [enhancedMutationFunction, mutationResult];
};

export const useSubscription = <TData = any, TVariables = OperationVariables>(
  subscription: DocumentNode,
  subscriptionHookOptions: SubscriptionHookOptions<TData, TVariables> = {}
): {
  variables: TVariables | undefined;
  loading: boolean;
  data?: TData | undefined;
  error?: import('apollo-client').ApolloError | undefined;
} => {
  return ApolloReactHooks.useSubscription<TData, TVariables>(
    subscription,
    offline.getSubscriptionOptions(subscriptionHookOptions)
  );
};
