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

## Usage

```typescript
import React from 'react';
import {useMutation, useQuery} from 'apollo-offline-hooks';
import {createTodoMutation, todosQuery} from './api/operations';
import {TodosList} from './TodosList';

export const TodosSimple = () => {
  const {data} = useQuery(todosQuery);
  const [createTodo] = useMutation(createTodoMutation, {updateQuery: todosQuery});
  const todos = data?.todos || [];

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

This is equivalent to

```typescript
import React from 'react';
import {useMutation, useQuery} from '@apollo/react-hooks';
import {createTodoMutation, todosQuery} from './api/operations';
import {TodosList} from './TodosList';

export const TodosSimple = () => {
  const {data} = useQuery(todosQuery);
  const [createTodo] = useMutation(createTodoMutation);
  const todos = data?.todos || [];

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
