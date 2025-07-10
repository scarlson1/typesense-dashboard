type ObjectDiff<T> = {
  [K in keyof T]?: T[K] extends object
    ? ObjectDiff<T[K]> | T[K] // allow nested diffs or new value
    : T[K] | undefined; // allow new value or undefined for deletion
};

/**
 * Nested object dif
 * @param obj1 initial object
 * @param obj2 new object
 * @returns added or changed properties. removed properties set to undefined.
 */
export function getObjectDiff<T extends Record<string, any>>(
  obj1: T,
  obj2: T
): ObjectDiff<T> {
  const diff: ObjectDiff<T> = {};

  // Check for modified or removed properties in obj1
  for (const key in obj1) {
    if (Object.prototype.hasOwnProperty.call(obj1, key)) {
      if (!Object.prototype.hasOwnProperty.call(obj2, key)) {
        // Property exists in obj1 but not in obj2 (removed)
        diff[key] = undefined; // Or some other indicator of removal
      } else if (obj1[key] !== obj2[key]) {
        // // Property exists in both but values are different (modified)
        // diff[key] = obj2[key];

        if (
          typeof obj1[key] === 'object' &&
          obj1[key] !== null &&
          typeof obj2[key] === 'object' &&
          obj2[key] !== null
        ) {
          // Recursively check for deep differences in nested objects
          const nestedDiff = getObjectDiff(obj1[key], obj2[key]);
          if (Object.keys(nestedDiff).length > 0) {
            diff[key] = nestedDiff as T[Extract<keyof T, string>] extends object
              ?
                  | T[Extract<keyof T, string>]
                  | ObjectDiff<T[Extract<keyof T, string>]>
              : T[Extract<keyof T, string>] | undefined; // as any as ObjectDiff<T[typeof key]>;
          }
        } else {
          diff[key] = obj2[key];
          // diff[key] = { oldValue: obj1[key], newValue: obj2[key] }; // Property value changed
        }
      }
    }
  }

  // Check for added properties in obj2
  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key)) {
      if (!Object.prototype.hasOwnProperty.call(obj1, key)) {
        // Property exists in obj2 but not in obj1 (added)
        diff[key] = obj2[key];
      }
    }
  }

  return diff;
}

// // Example usage:
// const objA = { name: 'Alice', age: 30, city: 'New York' };
// const objB = { name: 'Alice', age: 31, country: 'USA' };

// const differences = getObjectDiff(objA, objB);

// // Expected output: { age: 31, city: undefined, country: "USA" }

// function getObjectDiff(obj1, obj2) {
//   const diff = {};

//   // Find properties in obj1 that are different or missing in obj2
//   for (const key in obj1) {
//     if (obj1.hasOwnProperty(key)) {
//       if (!obj2.hasOwnProperty(key)) {
//         diff[key] = { oldValue: obj1[key], newValue: undefined }; // Property deleted
//       } else if (obj1[key] !== obj2[key]) {
//         if (
//           typeof obj1[key] === 'object' &&
//           obj1[key] !== null &&
//           typeof obj2[key] === 'object' &&
//           obj2[key] !== null
//         ) {
//           // Recursively check for deep differences in nested objects
//           const nestedDiff = getObjectDiff(obj1[key], obj2[key]);
//           if (Object.keys(nestedDiff).length > 0) {
//             diff[key] = nestedDiff;
//           }
//         } else {
//           diff[key] = { oldValue: obj1[key], newValue: obj2[key] }; // Property value changed
//         }
//       }
//     }
//   }

//   // Find properties in obj2 that are new (not in obj1)
//   for (const key in obj2) {
//     if (obj2.hasOwnProperty(key) && !obj1.hasOwnProperty(key)) {
//       diff[key] = { oldValue: undefined, newValue: obj2[key] }; // Property added
//     }
//   }

//   return diff;
// }
