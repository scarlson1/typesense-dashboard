export function diffArraysOfObjects<T = Record<string, any>>(
  initialArr: T[],
  newArr: T[],
  idField: keyof T
) {
  // const diff: { added: T[]; removed: T[]; updated: { old: T; new: T }[] } = {
  const diff: { added: T[]; removed: T[]; updated: T[] } = {
    added: [],
    removed: [],
    updated: [],
  };

  const map1 = new Map(initialArr.map((obj) => [obj[idField], obj]));
  const map2 = new Map(newArr.map((obj) => [obj[idField], obj]));

  // removed and updated
  for (const obj1 of initialArr) {
    const id = obj1[idField];
    if (!map2.has(id)) {
      diff.removed.push(obj1);
    } else {
      const obj2 = map2.get(id) as T;
      // Deep comparison to check for updates
      if (JSON.stringify(obj1) !== JSON.stringify(obj2)) {
        // diff.updated.push({
        //   old: obj1,
        //   new: obj2,
        // });
        diff.updated.push(obj2);
      }
    }
  }

  // added objects
  for (const obj2 of newArr) {
    const id = obj2[idField];
    if (!map1.has(id)) {
      diff.added.push(obj2);
    }
  }

  return diff;
}
