# RRBit
An ultra lightwieght(3kb), fast Immutable vectors/lists/arrays library using the technique 
described in the [paper](https://infoscience.epfl.ch/record/169879/files/RMTrees.pdf)
for Relaxed Radix Balanced(RRB) trees
 
## API
see [API Page](https://github.com/wishfoundry/rrbit/blob/master/API.md)


## Interoperability

<a href="https://github.com/fantasyland/fantasy-land"><img width="82" height="82" alt="Fantasy Land" src="https://raw.github.com/puffnfresh/fantasy-land/master/logo.png"></a>
<a href="https://github.com/rpominov/static-land"><img width="131" height="82" src="https://raw.githubusercontent.com/rpominov/static-land/master/logo/logo.png" /></a>

RRBit vectors also implement [Fantasy Land](https://github.com/fantasyland/fantasy-land) and [Static Land](https://github.com/rpominov/static-land) interfaces for `Monoid`, `Functor`, `Applicative`, and `Monad`.