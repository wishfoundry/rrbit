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
v1 rrbit            199971.94 op/s ±  0.90%   (91 samples)
v2 rrbit(w/focus)    35464.07 op/s ±  2.80%   (88 samples)
-------------------------------------------------------
```

```
push items to list performance - 1k
-------------------------------------------------------
native push(mutable)            210587.92 op/s ±  1.71%   (88 samples)
native slice + push               1057.54 op/s ±  1.07%   (89 samples)
immutable-js                      1791.59 op/s ±  1.23%   (89 samples)
immutable-array-methods           1697.13 op/s ±  2.07%   (88 samples)
mori                             29024.12 op/s ±  1.39%   (86 samples)
v1 rrbit                           382.12 op/s ±  1.34%   (85 samples)
v2 rrbit                          3990.70 op/s ±  1.57%   (87 samples)
v2 rrbit(builder mode)           30265.77 op/s ±  1.13%   (87 samples)
v3 rrbit                         22771.10 op/s ±  1.41%   (91 samples)
v3 rrb(builder mode)            162258.14 op/s ±  1.46%   (88 samples)
-------------------------------------------------------
```