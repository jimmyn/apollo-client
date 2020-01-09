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
