var express = require('express');

const userController = require('../controllers/userController');

var router = express.Router();

//Checking Whether User is LoggedIn

const verifyLogin = (req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    //  if(req.session.loggedIn){
    if (req.session.loginIn) {
        next()                                   //It is a type of Middleware that will check a condition 
    }
    else {
        res.redirect('/login')
    }
}
const forLoginAndSignupPage = (req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    //  if(req.session.loggedIn){
    if (req.session.loginIn) {
        res.redirect('/user-main')
    }
    else {
        next()                                   //It is a type of Middleware that will check a condition 
    }
}
var signupErr = null
var statuss = null


router.get('/', userController.homePage);

router.get('/user-main',userController.home)

router.get('/login',forLoginAndSignupPage, userController.userLoginGet);

router.post('/login',forLoginAndSignupPage, userController.userLoginPost);

router.get('/signup',forLoginAndSignupPage, userController.userSignupGet);

router.post('/signup',forLoginAndSignupPage, userController.userSignupPost);

router.get('/otp', userController.otpPageGet)

router.post('/get-otp', userController.getOtpPost);

router.post('/submit-otp', userController.submitOtpPost);

router.get('/view-product/:id', userController.productViewGetId);

router.get('/wish-list',verifyLogin,userController.wishListGet);

router.get('/add-to-wishlist/:id',verifyLogin,userController.addToWishListGet)

router.get('/wishlist_removeproduct/:id',verifyLogin,userController.WishListRemoveGet)

router.get('/cart', verifyLogin, userController.viewCartGet);

router.get('/add-to-cart/:id', verifyLogin, userController.addToCartGet);

router.post('/change-product-quantity', verifyLogin, userController.changeProductQuantityPost);

router.get('/place-order',verifyLogin,  userController.placeOrderGet);

router.post('/place-order',verifyLogin,  userController.placeOrderPost);

router.get('/myorders',verifyLogin,userController.myOrderGet);

router.get('/cancel-Order/:id',verifyLogin,userController.cancelOrderIdGet);

router.get('/order-return/:id',verifyLogin,userController.returnOrderIdGet);

router.get('/removefromcart/:id',verifyLogin,userController.removeFromCartGet);

router.get('/payment-success',verifyLogin,userController.paymentSuccesGet);

router.post('/verify-payment',verifyLogin,userController.verifyPaymentPost)

router.get('/ordered-products/:id', verifyLogin, userController.orderedproductGet);

router.get('/address', userController.addressGet);

router.post('/address', userController.addressPost);

router.get('/profile',verifyLogin,userController.profileGet)

router.post('/change-password',verifyLogin,userController.changePasswordPost)

router.post('/useraddress',verifyLogin,userController.userAddressPost)

router.post('/edit-profile/:id',verifyLogin,userController.editProfilePost)

router.post('/edit-user-address/:id',verifyLogin,userController.editUserAddressPost)

router.get('/deleteAddress/:id',verifyLogin,userController.DeleteAddressGet)

router.get('/logout', userController.logOutGet);

router.get('/filter',userController.filter1)

router.get('/walletHistory', userController.viewWalletHistory);

router.post('/coupon-apply',verifyLogin,userController.postApplyCoupon);


module.exports = router;
