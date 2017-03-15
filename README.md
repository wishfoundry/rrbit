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
push items to list performance - 1k
-------------------------------------------------------
immutable-js              1831.85 op/s ±  1.89%   (86 samples)
imm methods               1731.02 op/s ±  1.20%   (89 samples)
native                  212030.06 op/s ±  1.26%   (90 samples)
native slice() + push()   1052.16 op/s ±  1.05%   (84 samples)
mori                     29585.35 op/s ±  1.12%   (90 samples)
v1 rrb list                433.04 op/s ±  1.03%   (87 samples)
focusable(fast)          30351.12 op/s ±  1.25%   (89 samples)
focusable                 3816.54 op/s ±  1.42%   (89 samples)
-------------------------------------------------------
```