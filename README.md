<a href="https://github.com/wishfoundry/rrbit">
	<img width="82" height="82" alt="rrbit" src="https://raw.github.com/wishfoundry/rrbit/master/docs/logo-small.png">
</a>
# RRBit
An ultra lightwieght(3kb), fast Immutable vectors/lists/arrays library using the technique 
described in the [paper](https://infoscience.epfl.ch/record/169879/files/RMTrees.pdf)
for Relaxed Radix Balanced(RRB) trees

Note: this library is in alpha stage. while the code is tested and considered stable, breaking API changes are still being explored
 
## API
* RRBit promotes a functional style API with data last.
* Most functions are automatically curried 
see [API Page](https://github.com/wishfoundry/rrbit/blob/master/API.md)


## Interoperability

<a href="https://github.com/fantasyland/fantasy-land">
	<img width="82" height="82" alt="Fantasy Land" src="https://raw.github.com/puffnfresh/fantasy-land/master/logo.png">
</a>

RRBit vectors also implement [Fantasy Land](https://github.com/fantasyland/fantasy-land) interfaces for 
* `Monoid` 
* `Functor`
* `Applicative` 
* `Monad`(coming)
* Under consideration:
    * `Traversable`
    * `Foldable`


[Static Land](https://github.com/rpominov/static-land) expected to follow soon
 
 
 ###TODO:
 * explore compatibility with common JS libs(e.g. ramda uses a different curry signature)
 * tune and publish performance results
 * restructure project for smaller es6 module builds
 * dethrone ImmutableJS ftw!
 
 
 ### Performance
 performance tuning is a long way from complete, and any published results at this point are mostly meaningless 
 
 however... some things are showing some promise:
 
 ```
appending two lists performance(concat) - 100000
-------------------------------------------------------
immutable-js           39.05 op/s ±  1.43%   (51 samples)
seamless-immutable      13.68 op/s ±  3.54%   (38 samples)
native concat         1099.11 op/s ±  7.06%   (72 samples)
native slice+push      228.72 op/s ±  6.64%   (75 samples)
mori              18741394.72 op/s ±  1.01%   (90 samples)
v1 rrb list         199971.94 op/s ±  0.90%   (91 samples)
v2 rrb(w/focus)      35464.07 op/s ±  2.80%   (88 samples)
-------------------------------------------------------
```

```
append items to list performance(push) - 1k length
-------------------------------------------------------
immutable-js               1928.38 op/s ±  1.95%   (85 samples)
imm methods                1632.30 op/s ±  1.30%   (86 samples)
native(mutating)         203409.15 op/s ±  1.49%   (88 samples)
native slice()+push()       989.11 op/s ±  1.16%   (87 samples)
mori                      28209.22 op/s ±  1.50%   (85 samples)
v1 rrb list                 391.75 op/s ±  1.80%   (83 samples)
v2 focusable(fast)        11905.22 op/s ±  1.19%   (90 samples)
v2 focusable(standard)     3940.16 op/s ±  1.34%   (88 samples)
-------------------------------------------------------
```