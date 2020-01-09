import gql from 'graphql-tag';

export const postsQuery = gql`
  query posts {
    posts {
      id
      user_id
      title
      date
    }
  }
`;

export const featuredPostsQuery = gql`
  query posts {
    featuredPosts {
      id
      user_id
      title
      date
    }
  }
`;

export const createPostMutation = gql`
  mutation createPost($title: String!) {
    createPost(input: {title: $title}) {
      id
      user_id
      title
      date
    }
  }
`;

export const updatePostMutation = gql`
  mutation updatePost($id: ID!, $title: String!) {
    updatePost(id: $id, input: {title: $title}) {
      id
      user_id
      title
      date
    }
  }
`;

export const deletePostMutation = gql`
  mutation deletePost($id: ID!) {
    deletePost(id: $id) {
      id
      user_id
      title
      date
    }
  }
`;
