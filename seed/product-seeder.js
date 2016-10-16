var Product = require('../models/product');

var mongoose = require('mongoose');

mongoose.connect('localhost:27017/shopping');

//todo: add colors

var products = [
    new Product({
        imagePath: 'http://jstarsourcingbd.com/wp-content/uploads/2016/03/shirt-20.jpg',
        title: 'Swagmaster 9000',
        description: 'church-key la croix hell of street art cred semiotics lomo vinyl pickled kombucha cronut fap. Disrupt poke cold-pressed deep v',
        price: 300
    }),
    new Product({
        imagePath: 'http://maniacs.com/subManiacs/wp-content/uploads/2015/02/p_camp_shirt_mango_zm.jpg',
        title: 'Boring Shirt Title',
        description: 'Sustainable humblebrag church-key, DIY mixtape everyday carry street art pug cliche lomo organic. Sustainable craft beer affogato before they sold out. Echo park artisan lumbersexual PBR&B',
        price: 10
    }),
    new Product({
        imagePath: 'http://image.sportsmansguide.com/adimgs/l/2/228743_ts.jpg',
        title: 'Buy this one and the rest too',
        description: 'Pour-over stumptown letterpress cold-pressed, williamsburg umami disrupt af ethical gastropub gentrify whatever. 3 wolf moon deep v succulents quinoa.',
        price: 5
    }),
    new Product({
        imagePath: 'http://bhuiyaninternational.biz/wp-content/flagallery/shirt-men/shirt-men-4.jpg',
        title: '#YOLO',
        description: 'Chartreuse waistcoat franzen, kale chips dreamcatcher activated charcoal single-origin coffee. Heirloom la croix cliche VHS, polaroid 3 wolf moon pickled. Cardigan deep v tacos synth pop-up drinking vinegar. ',
        price: 12
    }),
    new Product({
        imagePath: 'https://ih1.redbubble.net/image.14622454.4485/ra,unisex_tshirt,x3104,fafafa:ca443f4786,front-c,650,630,900,975-bg,f8f8f8.u1.jpg',
        title: 'Probably the best option.',
        description: 'PBR&B retro tattooed, bicycle rights meditation bitters cred four dollar toast',
        price: 32
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