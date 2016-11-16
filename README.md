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
 appending two identical lists together
 -------------------------------------------------------
 immutable-js               38.33 op/s ±  2.69%   (50 samples)
 seamless-immutable         13.63 op/s ±  4.18%   (38 samples)
 native concat            1072.89 op/s ±  6.73%   (73 samples)
 native slice()+push()     227.34 op/s ±  7.04%   (75 samples)
 mori                 18446134.21 op/s ±  2.09%   (82 samples)
 rrbit                 3862109.71 op/s ±  1.85%   (89 samples)
 -------------------------------------------------------
```
