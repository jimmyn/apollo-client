# Apollo Offline Hooks

A drop-in replacement for [@apollo/react-hooks](https://www.apollographql.com/docs/react/api/react-hooks/) with automatic cache updates. It will update apollo cache based on a mutation or subscription result.

## Install
```
npm i apollo-offline-hooks @apollo/react-hooks --save
```
or
```
yarn add apollo-offline-hooks @apollo/react-hooks
```

## Setup

```typescript jsx
import React from 'react';
import {render} from 'react-dom';
import ApolloClient from 'apollo-boost';
import {ApolloProvider} from 'apollo-offline-hooks';

const client = new ApolloClient({
  uri: 'localhost:8080',
});

const App = () => (
  <ApolloProvider client={client}>
    <div>
      <h2>My first Apollo app 🚀</h2>
    </div>
  </ApolloProvider>
);

render(<App />, document.getElementById('root'));
```

## Mutations

This package extends `useMutation` options allowing to update cached queries in one line of code instead of writing complex `update` functions.

For example this code

```typescript jsx
import React from 'react';
import {useMutation, useQuery} from 'apollo-offline-hooks';
import {createTodoMutation, todosQuery} from './api/operations';
import {TodosList} from './TodosList';

export const Todos = () => {
  const {data} = useQuery(todosQuery);
  const todos = data?.todos || [];
  
  const [createTodo] = useMutation(createTodoMutation, {
    updateQuery: todosQuery // <== notice updateQuery option
  });
  

  const handleCreateTodo = () => {
    return createTodo({
      variables: {
        task: 'New todo',
        createdAt: new Date().toISOString()
      }
    });
  };

  return (
    <div>
      <button onClick={handleCreateTodo}>Create todo</button>
      <TodosList todos={todos} />
    </div>
  );
};
```

is equivalent to

```typescript jsx
import React from 'react';
import {useMutation, useQuery} from '@apollo/react-hooks';
import {createTodoMutation, todosQuery} from './api/operations';
import {TodosList} from './TodosList';

export const Todos = () => {
  const {data} = useQuery(todosQuery);
  const todos = data?.todos || [];
  
  const [createTodo] = useMutation(createTodoMutation);
  
  const handleCreateTodo = () => {
    return createTodo({
      variables: {
        task: 'New todo',
        createdAt: new Date().toISOString()
      },
      update: (proxy, {data}) => {
        const newTodo = data.createTodo;
        const cache = proxy.readQuery({query: todosQuery});
        proxy.writeQuery({
          query: todosQuery,
          data: {
            todos: [...cache.todos, newTodo]
          }
        });
      }
    });
  };

  return (
    <div>
      <button onClick={handleCreateTodo}>Create todo</button>
      <TodosList todos={todos} />
    </div>
  );
};
```

And this code

```typescript jsx
import React from 'react';
import {useMutation} from 'apollo-offline-hooks';
import {Todo} from './api/generated';
import {deleteTodoMutation, todosQuery, updateTodoMutation} from './api/operations';

type Props = {
  todo: Todo;
};

export const Todo: React.FC<Props> = ({todo}) => {
  const [deleteTodo] = useMutation(deleteTodoMutation, {
    updateQuery: todosQuery // <== notice updateQuery option
    
    // to delete an item we need to provide it's id
    // if our api simply returns true when item is deleted
    // we need to return an id explicitly
    mapResultToUpdate: data => todo 
  });
  const [updateTodo] = useMutation(updateTodoMutation);

  const handleDeleteTodo = () => {
    return deleteTodo({
      variables: {id: todo.id}
    });
  };

  const handleUpdateTodo = () => {
    return updateTodo({
      variables: {id: todo.id, done: !todo.done}
    });
  };

  return (
    <li>
      <input type="checkbox" checked={todo.done} onChange={handleUpdateTodo} />
      {todo.task}
      <button onClick={handleDeleteTodo}>delete</button>
    </li>
  );
};
```

is equivalent to

```typescript jsx
import React from 'react';
import {useMutation} from 'apollo-offline-hooks';
import {Todo} from './api/generated';
import {deleteTodoMutation, todosQuery, updateTodoMutation} from './api/operations';

type Props = {
  todo: Todo;
};

export const Todo: React.FC<Props> = ({todo}) => {
  const [deleteTodo] = useMutation(deleteTodoMutation);
  const [updateTodo] = useMutation(updateTodoMutation);

  const handleDeleteTodo = () => {
    return deleteTodo({
      variables: {id: todo.id},
      update: proxy => {
        const cache = proxy.readQuery({query: todosQuery});
        proxy.writeQuery({
          query: todosQuery,
          data: {
            todos: cache.todos.filter(item => item.id !== todo.id)
          }
        });
      }
    });
  };

  const handleUpdateTodo = () => {
    // apollo client is clever enough to update an item in cache
    return updateTodo({
      variables: {id: todo.id, done: !todo.done}
    });
  };

  return (
    <li>
      <input type="checkbox" checked={todo.done} onClick={handleUpdateTodo} />
      {todo.task}
      <button onClick={handleDeleteTodo}>delete</button>
    </li>
  );
};

```

## `useMutation` offline options

| Option | Description | Default |
| --- | --- | --- |
| `updateQuery` | A graphql query (wrapped in `gql` tag) that should be updated. You can pass query directly or specify it with variables `{query: todosQuery, variables: {limit: 10}}` |
| `idField` | Unique field that is used to find the item in cache. It should be present in the mutation response | `id` 
| `operationType` | Indicates what type of the operation should be performed e.g. add/remove/update item. By default operation type is automatically detected from mutation name e.g. `createTodo` will result in `OperationTypes.ADD`. | `OperationTypes.AUTO`
| `mapResultToUpdate` | A function that receives mutation result and returns an updated item. Function result should contain at least an id field |

Offline options can be passed to the `useMutation` hook or to the mutation function directly.

```typescript jsx
const [deleteTodo] = useMutation(deleteTodoMutation, {
  updateQuery: todosQuery,
  mapResultToUpdate: data => todo
});

const handleDeleteTodo = () => {
  return deleteTodo({
    variables: {id: todo.id}
  });
};
```

is the same as

```typescript jsx
const [deleteTodo] = useMutation(deleteTodoMutation);

const handleDeleteTodo = () => {
  return deleteTodo({
    variables: {id: todo.id},
    updateQuery: todosQuery,
    mapResultToUpdate: data => todo
  });
};
```

## Subscriptions

`useSubscription` accepts the same offline options as `useMutation`

```typescript jsx
useSubscription(onTodoUpdate, {updateQuery: todosQuery});
```

## Customize default configurations

Default configurations can be customized by calling `setOfflineConfig`

```typescript jsx
import {setOfflineConfig} from 'apollo-offline-hooks';

setOfflineConfig({
  getIdFieldFromObject(item: any) {
    switch (item.__typename) {
      case 'Todo':
        return 'id';
      case 'User':
        return 'user_id'
    }
  }
});
```

## Configuration options

| Option | Description | Default |
| --- | --- | --- |
| `idField` | Unique field that is used to find the item in cache. It should be present in the mutation response | `id` 
| `getIdFieldFromObject` | A function that receives updated item and returns an id field name. If defined it will tke precedence over `idField`
| `prefixesForRemove` | A list of mutation name prefixes that will result in remove operation | [prefixesForRemove](src/const.ts#L8)
| `prefixesForUpdate` | A list of mutation name prefixes that will result in update operation | [prefixesForUpdate](src/const.ts#L19)
| `prefixesForAdd` | A list of mutation name prefixes that will result in add operation | [prefixesForAdd](src/const.ts#L32)

## Credits
This package is based on [Amplify Offline Helpers](https://github.com/awslabs/aws-mobile-appsync-sdk-js/blob/master/OFFLINE_HELPERS.md)
