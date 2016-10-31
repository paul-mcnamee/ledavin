var Product = require('../models/product');

var mongoose = require('mongoose');

mongoose.connect('localhost:27017/shopping');


var products = [
    new Product({
        imagePaths: ['http://jstarsourcingbd.com/wp-content/uploads/2016/03/shirt-20.jpg', 'http://jstarsourcingbd.com/wp-content/uploads/2016/03/shirt-20.jpg'],
        title: 'Swagmaster 9000',
        description: 'church-key la croix hell of street art cred semiotics lomo vinyl pickled kombucha cronut fap. Disrupt poke cold-pressed deep v',
        price: 300,
        colors: ['orange'],
        materials: [{ name: 'cotton', link: 'http://3v6x691yvn532gp2411ezrib.wpengine.netdna-cdn.com/wp-content/uploads/sites/default/files/20130830-adc.png'}]
    }),
    new Product({
        imagePaths: ['http://maniacs.com/subManiacs/wp-content/uploads/2015/02/p_camp_shirt_mango_zm.jpg', 'http://maniacs.com/subManiacs/wp-content/uploads/2015/02/p_camp_shirt_mango_zm.jpg', 'http://maniacs.com/subManiacs/wp-content/uploads/2015/02/p_camp_shirt_mango_zm.jpg'],
        title: 'Boring Shirt Title',
        description: 'Sustainable humblebrag church-key, DIY mixtape everyday carry street art pug cliche lomo organic. Sustainable craft beer affogato before they sold out. Echo park artisan lumbersexual PBR&B',
        price: 10,
        colors: ['black'],
        materials: [{name: 'metal', link:'http://previews.123rf.com/images/traffico/traffico1207/traffico120700005/14387132-Seamless-triangle-pattern-Stock-Vector-geometric.jpg'}]
    }),
    new Product({
        imagePaths: ['http://image.sportsmansguide.com/adimgs/l/2/228743_ts.jpg', 'http://image.sportsmansguide.com/adimgs/l/2/228743_ts.jpg'],
        title: 'Buy this one and the rest too',
        description: 'Pour-over stumptown letterpress cold-pressed, williamsburg umami disrupt af ethical gastropub gentrify whatever. 3 wolf moon deep v succulents quinoa.',
        price: 5,
        colors: ['green'],
        materials: [{ name: 'latex', link:'https://images.blogthings.com/whatpatternisyourbrainquiz/pattern-2.jpg' }]
    }),
    new Product({
        imagePaths: ['http://bhuiyaninternational.biz/wp-content/flagallery/shirt-men/shirt-men-4.jpg', 'http://bhuiyaninternational.biz/wp-content/flagallery/shirt-men/shirt-men-4.jpg', 'http://bhuiyaninternational.biz/wp-content/flagallery/shirt-men/shirt-men-4.jpg', 'http://bhuiyaninternational.biz/wp-content/flagallery/shirt-men/shirt-men-4.jpg'],
        title: '#YOLO',
        description: 'Chartreuse waistcoat franzen, kale chips dreamcatcher activated charcoal single-origin coffee. Heirloom la croix cliche VHS, polaroid 3 wolf moon pickled. Cardigan deep v tacos synth pop-up drinking vinegar. ',
        price: 12,
        colors: ['yellow'],
        materials: [{ name: 'linen', link: 'https://s-media-cache-ak0.pinimg.com/236x/c0/40/c5/c040c5d4fbdf16556d3ca09f44093977.jpg' }]
    }),
    new Product({
        imagePaths: ['https://ih1.redbubble.net/image.14622454.4485/ra,unisex_tshirt,x3104,fafafa:ca443f4786,front-c,650,630,900,975-bg,f8f8f8.u1.jpg', 'https://ih1.redbubble.net/image.14622454.4485/ra,unisex_tshirt,x3104,fafafa:ca443f4786,front-c,650,630,900,975-bg,f8f8f8.u1.jpg'],
        title: 'Probably the best option.',
        description: 'PBR&B retro tattooed, bicycle rights meditation bitters cred four dollar toast',
        price: 32,
        colors: ['blue'],
        materials: [{ name: 'wool', link: 'https://images.blogthings.com/thejapanesepatterntest/japanese-pattern-1.png'}]
    })
];

//load all of the products into the document
var done = 0;
for (var i=0; i < products.length; i++){
    products[i].save(function(err, result){
        done++;
        if (done === products.length){
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}