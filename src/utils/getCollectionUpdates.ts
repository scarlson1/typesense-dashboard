import type { CollectionSchema } from 'typesense/lib/Typesense/Collection';
import { diffArraysOfObjects } from './diffArrayOfObjects';

export const getCollectionUpdates = (
  initialFields: CollectionSchema['fields'],
  newFields: CollectionSchema['fields']
) => {
  const { added, removed, updated } = diffArraysOfObjects<any>(
    initialFields,
    newFields,
    'name'
  );

  let fieldUpdates = [];
  for (let r of removed) fieldUpdates.push({ name: r.name, drop: true });
  for (let u of updated) {
    fieldUpdates.push({ name: u.name, drop: true });
    fieldUpdates.push(u);
  }
  for (let a of added) fieldUpdates.push(a);

  return fieldUpdates;
};
