import * as ApolloClient from '@apollo/client';
import * as offline from './offline';
import {DocumentNode, ExecutionResult} from 'graphql';

export * from './const';
export * from '@apollo/client';

export type OfflineOptions<TData> = offline.OfflineOptions<TData>;
export const setOfflineConfig = offline.setConfig;
export const updateApolloCache = offline.updateCache;

export type MutationHookOptions<TData, TVariables> = ApolloClient.MutationHookOptions<
  TData,
  TVariables
> &
  OfflineOptions<TData>;

export type MutationFunctionOptions<TData, TVariables> = ApolloClient.MutationFunctionOptions<
  TData,
  TVariables
> &
  OfflineOptions<TData>;

export type MutationTuple<TData, TVariables> = [
  (options?: MutationFunctionOptions<TData, TVariables>) => Promise<ExecutionResult<TData>>,
  ApolloClient.MutationResult<TData>
];

export interface SubscriptionHookOptions<TData = any, TVariables = ApolloClient.OperationVariables>
  extends ApolloClient.BaseSubscriptionOptions<TData, TVariables>,
    OfflineOptions<TData> {
  subscription?: DocumentNode;
}

export const useMutation = <TData = any, TVariables = ApolloClient.OperationVariables>(
  mutation: DocumentNode,
  {
    updateQuery,
    idField,
    operationType,
    mapResultToUpdate,
    ...mutationHookOptions
  }: MutationHookOptions<TData, TVariables> = {}
): MutationTuple<TData, TVariables> => {
  const [mutationFunction, mutationResult] = ApolloClient.useMutation(
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

export const useSubscription = <TData = any, TVariables = ApolloClient.OperationVariables>(
  subscription: DocumentNode,
  subscriptionHookOptions: SubscriptionHookOptions<TData, TVariables> = {}
): {
  variables: TVariables | undefined;
  loading: boolean;
  data?: TData | undefined;
  error?: ApolloClient.ApolloError | undefined;
} => {
  return ApolloClient.useSubscription<TData, TVariables>(
    subscription,
    offline.getSubscriptionOptions(subscriptionHookOptions)
  );
};
