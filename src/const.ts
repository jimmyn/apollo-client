export enum CacheOperationTypes {
  AUTO = 'auto',
  ADD = 'add',
  REMOVE = 'remove',
  UPDATE = 'update'
}

export const prefixesForRemove = [
  'delete',
  'deleted',
  'discard',
  'discarded',
  'erase',
  'erased',
  'remove',
  'removed'
];

export const prefixesForUpdate = [
  'update',
  'updated',
  'upsert',
  'upserted',
  'edit',
  'edited',
  'modify',
  'modified',
  'analyze',
  'activate'
];

export const prefixesForAdd = [
  'create',
  'created',
  'put',
  'set',
  'add',
  'added',
  'new',
  'insert',
  'inserted',
  'duplicate',
  'import'
];
