//TODO: cart would be added to the session, maybe should store in the db for logged in users -- need to add a cart schema
module.exports = function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalQuantity = oldCart.totalQuantity || 0;
    this.totalPrice = oldCart.totalPrice || 0;
    this.totalDiscount = oldCart.totalDiscount || 0;
    this.coupons = oldCart.coupons || {};
    this.hasCoupon = oldCart.hasCoupon || false;
    this.selectedMeasurements = oldCart.selectedMeasurements || {};
    this.selectedContact = oldCart.selectedContact || {};
    this.subtotal = oldCart.subtotal || 0;

    /**
     * add an additional item to the cart
     * @param item
     * @param itemId
     */
    this.addItem = function(item, itemId) {
        var storedItem = this.items[itemId];

        //if there is no item, add the new item
        if (!storedItem){
            storedItem = this.items[itemId] = {
                item: item,
                qty: 0,
                price: 0,
                measurements: {
                    shoulderSlope: 'Normal',
                    tuckPreference: 'Tucked',
                    fit: 'Normal'
                }
            };
        }

        //update the new quantity and price of the items in the cart
        storedItem.qty++;
        storedItem.price = storedItem.item.price * storedItem.qty;

        this.updateCartTotals();
    };

    /**
     * add a coupon code and apply the discount
     * @param couponId
     * @param productId
     * @param couponType
     * @param couponDescription
     * @param couponCode
     * @param couponPercentage
     */

    this.addCoupon = function(couponId, couponCode, productId, couponPercentage, couponType, couponDescription) {
        if (!(couponId == undefined)){
            this.coupons = {}; // only 1 coupon at a time so if we add a new one we need to clear the others
            var storedCoupon = this.coupons[couponId];
            //TODO: prompt the user that they can only apply 1 coupon
            storedCoupon = this.coupons[couponId] = {couponCode: couponCode, productId: productId,
                couponPercentage: couponPercentage, couponType: couponType, couponDescription: couponDescription};

            this.hasCoupon = true;

            //update the new quantity and price of the items in the cart
            this.updateCartTotals();
        }
        else{
            //TODO: display error
        }
    };

    /**
     * remove the coupon code and remove the discount
     * @param couponId
     */
    this.removeCoupon = function(couponId) {
        var storedCoupon = this.coupons[couponId];

        //make sure the coupon exists
        if (storedCoupon){

            //delete the coupon
            delete this.coupons[couponId];

            //update the cart
            this.updateCartTotals();

            this.hasCoupon = false;
        }
    };


    /**
     * update the quantity of a given item in the shopping cart
     * @param item
     * @param itemId
     * @param newQty
     */
    this.updateItemQuantity = function(item, itemId, newQty) {
        var storedItem = this.items[itemId];

        //this was being passed in as a string so we need to change it to int
        newQty = parseInt(newQty, 10);

        //make sure the item exists
        if (storedItem){

            //remove the item
            if (newQty <= 0){
                this.removeItem(item, itemId);
            }
            //find the difference between new and old qty and update the price and quantity
            else{
                //change the quantity and price
                storedItem.qty = newQty;
                storedItem.price = storedItem.item.price * storedItem.qty;

                //update the totals in the cart
                this.updateCartTotals();
            }
        }
    };

    /**
     * remove an item from the shopping cart
     * @param item
     * @param itemId
     */
    this.removeItem = function(item, itemId) {
        var storedItem = this.items[itemId];

        //make sure the item exists
        if (storedItem){

            //remove the quantity from the stored item
            storedItem.qty = 0;
            storedItem.price = 0;

            //delete the item
            delete this.items[itemId];

            //update the cart
            this.updateCartTotals();
        }
    };

    /**
     * apply coupons and update the totals in the cart for price and quantity
     */
    this.updateCartTotals = function(){
        this.totalQuantity = 0;
        this.totalPrice = 0;
        this.totalDiscount = 0;
        this.subtotal = 0;

        //loop through each current item in the cart and update the totals for price and quantity
        for (var item in this.items){
            this.totalQuantity += this.items[item].qty;
            this.totalPrice += this.items[item].price;
        }

        this.subtotal = this.totalPrice;

        //apply discounts from coupons
        if (this.hasCoupon){
            for (var coupon in this.coupons){ //should just be 1 for now, maybe multiple coupons later

                if (!(coupon == "undefined")){
                    var couponCode = this.coupons[coupon].couponCode;
                    var percent = this.coupons[coupon].couponPercentage;
                    var productId = this.coupons[coupon].productId;
                    var couponType = this.coupons[coupon].couponType;
                    var couponDescription = this.coupons[coupon].couponDescription;

                    if (couponType == 'item'){
                        //if the product specific to the coupon exists in the cart then apply the discount
                        if (this.items[productId]){
                            this.totalDiscount += ((percent/100) * (this.items[productId].price));
                            this.totalPrice -= ((percent/100) * (this.items[productId].price));
                        }
                    }
                    if (couponType == 'total'){
                        //if the coupon is for the total order, apply to each item in the cart
                        for (var cartItem in this.items){
                            if (this.items[cartItem]) {
                                this.totalDiscount += ((percent/100) * (this.items[cartItem].price));
                                this.totalPrice -= ((percent/100) * (this.items[cartItem].price));
                            }
                        }
                    }
                    else {
                        //TODO: log something for unexpected coupon type
                    }
                }
            }
        }

        //TODO: round and format total price and discount for USD

    };

    this.updateMeasurements = function (measurements) {
        this.selectedMeasurements = measurements;
    };

    this.updateContact = function (contact) {
        this.selectedContact = contact;
    };

    /**
     * generate the array of items in the cart to be processed by the front end
     * @returns {Array}
     */
    this.generateArray = function() {
        var arr = [];
        for (var itemId in this.items){
            arr.push(this.items[itemId]);
        }
        return arr;
    };


    /**
     * generate the coupons that the user had already entered (should be singular currently since we delete the old one)
     * @returns {Array}
     */
    this.generateCouponsArray = function() {
        var arr = [];
        for (var coupon in this.coupons){
            arr.push(this.coupons[coupon]);
        }
        return arr;
    };

};