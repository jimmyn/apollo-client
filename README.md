# Apollo Offline Hooks

A drop-in replacement for [@apollo/react-hooks](https://www.apollographql.com/docs/react/api/react-hooks/) with automatic cache updates. It will try to guess how your apollo cache should be updated based on the mutation

## Install
```
npm i apollo-offline-hooks @apollo/react-hooks --save
```
or
```
yarn add apollo-offline-hooks @apollo/react-hooks
```

## Setup

```typescript
import React from 'react';
import {render} from 'react-dom';
import ApolloClient from 'apollo-boost';

const client = new ApolloClient({
  uri: 'localhost:8080',
});

import {ApolloProvider} from 'apollo-offline-hooks';

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

```typescript
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

```typescript
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

```typescript
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

```typescript
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
| `operationType` | Indicates what type of the operation should be performed e.g. add/remove/update item. By default operation type is automatically detacted from mutation name e.g. `createTodo` will result in `OperationTypes.ADD`. | `OperationTypes.AUTO`
| `mapResultToUpdate` | A function that receives mutation result and returns an updated item. Function result should contain at least an id field |
