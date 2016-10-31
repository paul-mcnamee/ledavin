module.exports = {

    //checks if the user is logged in
    isLoggedIn: function(req, res, next){
        if (req.isAuthenticated()){
            return next();
        }
        //save the url the user came from
        req.session.oldUrl = req.url;
        res.redirect('/user/signin');
    },

    //checks if the user is not logged in
    notLoggedIn: function(req, res, next){
        if (!req.isAuthenticated()){
            return next();
        }
        res.redirect('/');
    },

    //checks if the value exists in the passed in array of values
    isInArray: function(value, array) {
        return array.indexOf(value) > -1;
    },
};
