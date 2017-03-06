in an effort to find a more performant immutable operations(slice, append, prepend and concat)
on leaves(lists of < 32 length), several experiments exist in this folder to compare
various function/persistent/immutable data structures


### Contents:
 - SkewList - an implementation of Random Access Lists
 - Block - an experiment with Hash Array Map Trees using 4, 8 and 16 element leafs(instead of the canonical 32)