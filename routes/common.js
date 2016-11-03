module.exports = {

    //TODO: might want to separate the permissions helpers out into a separate file at some point

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

    //TODO: probably could make a generic checker for level
    hasAdminPermissions: function(req, res, next){
        if (req.hasOwnProperty("user") && req.user.permissions != null && req.user.permissions.hasOwnProperty("group")){
            if (req.user.permissions.group === "admin"){
                return next();
            }
        }
        res.redirect('/');
    },
};
