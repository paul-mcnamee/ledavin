var Coupon = require('../models/coupon');

var mongoose = require('mongoose');

mongoose.connect('localhost:27017/shopping');

var coupons = [
    new Coupon({
        code: 'WAYNE',
        type: 'item',
        description: 'This should give a 10 percent discount on Wayne\'s shirt',
        percentage: 10,
        product_id: '57797ff700e757182a1f0d9a'
    }),
    new Coupon({
        code: 'FIRST10',
        type: 'item',
        description: 'This should give a 10 percent discount on the chick magnet shirt',
        percentage: 10,
        product_id: '57797ff700e757182a1f0d9c'
    }),
    new Coupon({
        code: 'FIRST50',
        type: 'total',
        description: 'This should give a 50 percent discount to the total',
        percentage: 50
    }),
    new Coupon({
        code: 'FREE',
        type: 'total',
        description: 'This should give a 100 percent discount to the total',
        percentage: 100
    })
];

//load all of the products into the document
var done = 0;
for (var i=0; i < coupons.length; i++){
    coupons[i].save(function(err, result){
        done++;
        if (done === coupons.length){
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}