export const isObject = (object: any) => object != null && typeof object === 'object';

export const pick = (obj: {[key: string]: any} | undefined, keys: string[]) => {
  const result: {[key: string]: any} = {};
  if (!obj) return result;
  keys.forEach(key => {
    if (obj[key] === undefined) return;
    result[key] = obj[key];
  });
  return result;
};

export const findArrayInObject = (obj: any, path: string[] = []): string[] | undefined => {
  if (Array.isArray(obj)) return path;
  if (!isObject(obj)) return undefined;
  let result: string[] | undefined;
  Object.keys(obj).some(key => {
    const newPath = findArrayInObject(obj[key], path.concat(key));
    if (newPath) {
      result = newPath;
      return true;
    }
    return false;
  });
  return result;
};

export const getValueByPath = (obj: any, path?: string[]) => {
  if (!isObject(obj) || !path || path.length === 0) return obj;
  return path.reduce((acc, elem) => {
    const val = acc?.[elem];
    if (val) return val;
    return null;
  }, obj);
};

export const setValueByPath = (obj: {[key: string]: any}, path: string[] = [], value: any) =>
  path.reduce((acc, elem, i, arr) => {
    if (arr.length - 1 === i) {
      acc[elem] = value;
      return obj;
    }
    return acc[elem];
  }, obj);
