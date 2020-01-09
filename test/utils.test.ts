import {pick, findArrayInObject, getValueByPath, setValueByPath, isObject} from 'utils';

const data = {
  posts: [
    {id: 1, user_id: 1, title: 'A day on the beach', date: '2018-01-01'},
    {id: 24, user_id: 10, title: 'Coding for joy', date: '2018-12-24'},
    {id: 25, user_id: 9, title: 'On the road', date: '2018-12-25'}
  ],
  total: 3,
  has_next: false
};

test('isObject', () => {
  expect(isObject({})).toBeTruthy();
  expect(isObject({foo: 'bar'})).toBeTruthy();
  expect(isObject([])).toBeTruthy();
  expect(isObject(null)).toBeFalsy();
  expect(isObject(undefined)).toBeFalsy();
  expect(isObject(true)).toBeFalsy();
});

test('pick', () => {
  expect(pick(data, ['total', 'has_next'])).toEqual({total: data.total, has_next: data.has_next});
});

test('findArrayInObject', () => {
  expect(findArrayInObject({foo: 'bar'})).toBeUndefined();
  expect(findArrayInObject(data)).toEqual(['posts']);
  expect(findArrayInObject({data})).toEqual(['data', 'posts']);
});

test('getValueByPath', () => {
  expect(getValueByPath(data, ['total'])).toBe(data.total);
  expect(getValueByPath({data}, ['total'])).toBeNull();
  expect(getValueByPath({data}, ['data', 'has_next'])).toBe(data.has_next);
  expect(getValueByPath({result: {data}}, ['result', 'data', 'posts'])).toEqual(data.posts);
});

test('setValueByPath', () => {
  const input = {result: {data: {...data}}};
  const output = {result: {data: {...data, total: 10, posts: []}, foo: 'bar'}};
  let result = setValueByPath(input, ['result', 'data', 'total'], 10);
  result = setValueByPath(result, ['result', 'data', 'posts'], []);
  result = setValueByPath(result, ['result', 'foo'], 'bar');
  expect(result).toEqual(output);
});
