
## Creating Lists:

### create from arguments
```javascript
import List from 'rrbit'
const list = List.of(1,2,3,4) //-> [1,2,3,4]
```

### create from an iterable
```javascript
import List from 'rrbit'
const list = List.from([1,2,3,4]); //-> [1,2,3,4]
// or from a map
const list = List.from(new Map([['a', 1], ['b', 2], ['c', 2]]));
```

### create an empty list
```javascript
import List from 'rrbit'
const list = List.empty();
const list2 = List.empty();
// all empty lists, no matter how they are created, are equal
list === list2 //-> true

```

### create a range, using an input function
```javascript
import List from 'rrbit'
const timesTwo = (i) => i * 2
const list = List.times(timesTwo, 5) // -> [2,4,6,8,10]
```




## operations


#### get size of a list
`List.lengthOf(List)`
```javascript
import List from 'rrbit'

const list1 = List.of(1,2,3);
const size = List.lengthOf(list1); //-> 3a
const size2 = list1.length;        //-> 3
```

#### adding items to a list
set an element at a particular index, returns an updated array
if the index is out of range, the array is unaltered

`List.push(Any, List)`
```javascript
import List from 'rrbit'

const list = List.push(item, list);
const list2 = list.push(item);
```

### join two lists together
also know as `concat` is some languages.
note: does 'not' recursively concat children

`List.append(List, List)`
```javascript
import List from 'rrbit'

const list1 = List.of(1,2,3);
const list2 = List.of(4,5,6);
const list3 = List.of(7,8,9);

const list = List.append(list1, list2); //-> [1,2,3,4,5,6]
//or
const other = list.append(list3);       //-> [1,2,3,4,5,6,7,8,9]
```


### get an item in a list
`List.get(Number)`
```javascript
import List from 'rrbit'
const list = List.of('a','b','c');

var item = list.get(2); //-> 'b 
```

### set an item in a list
`List.set(Number, Any)`
```javascript
import List from 'rrbit'
const list = List.of('a','b','c');

var item = list.set(2, 'd'); //-> ['a','d','c']
```

### transform a list
`List.map(Function, List)`
```javascript
import List from 'rrbit'
// note the map fn is value
const double = (x, i) => x + x

const list = List.of('a','b','c');
const lis2 = List.map(double, list); //-> ['aa','bb ,'cc']
const list3 = list2.map(double);     //-> ['aaaa','bbbb ,'cccc']
```

### slice
get a subsection of a list, the `start` and end are a 0 based index of the list.
the slice is up to, but not including `end`.
both start and end can be negative

List.slice 
List.filter
List.foldr
List.foldl
List.reverse