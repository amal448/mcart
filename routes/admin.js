var express = require('express');
const app = require('../app');

const adminController = require('../controllers/adminController');

var router = express.Router();

///////////////////////////////// Login Credentials ////////////////////////
const verifyLogin = (req, res, next) => {
    //  if(req.session.loggedIn){
    if (req.session.adminLoggedIn) {
        next()                                   //It is a type of Middleware that will check a condition 
    }
    else {
        // res.redirect('/admin')
        res.redirect('/admin/admin-login')

    }
}



router.get('/', verifyLogin,adminController.mainPageGet);

router.get('/admin-login', adminController.adminLoginGet);

router.post('/admin-login', adminController.adminLoginPost);

router.get('/view-product/:id', verifyLogin, adminController.ViewProductGet);

router.get('/admin-dashboard',verifyLogin, adminController.adminDashboardGet);

router.get('/view-user/:id', verifyLogin, adminController.ViewUserGet);

router.get('/view-category/:id', verifyLogin, adminController.ViewCategoryGet);

router.get('/view-order/:id',verifyLogin, adminController.ViewOrderGet);

router.get('/add-category', verifyLogin, adminController.addCategoryGet);

router.post('/add-category', verifyLogin, adminController.addCategoryPost);

router.get('/add-product', verifyLogin, adminController.addProductGet)

router.post('/add-product', verifyLogin, adminController.addProductPost)

router.get('/add-productoffer', verifyLogin,adminController.addProductOfferGet);

router.post('/add-productoffer', verifyLogin,adminController.addProductOfferPost);

router.get('/add-categoryoffer', verifyLogin, adminController.addCategoryOfferGet);

router.post('/add-categoryoffer', verifyLogin, adminController.addCategoryOfferPost);

router.get('/view-coupon',verifyLogin,adminController.getlistCoupon)

router.get('/add-coupon',verifyLogin,adminController.getAddCoupon)

router.post('/add-coupon',verifyLogin,adminController.postAddCoupon)

router.get('/edit-coupon/:id',verifyLogin,adminController.geteditCoupon)

router.post('/edit-coupon/:id',verifyLogin,adminController.posteditcoupon)

router.get('/delete-coupon/:id',verifyLogin,adminController.deleteCoupon)


 router.get('/edit-productoffer/:id',verifyLogin,adminController.editProductOfferGet)

 router.post('/edit-productoffer',verifyLogin,adminController.editProductOfferPost)

 router.get('/delete-productoffer/:id',verifyLogin, adminController.deleteProductOfferGet);

 router.get('/edit-categoryOffer/:id',verifyLogin, adminController.editCategoryOfferGet);

 router.post('/edit-categoryoffer',verifyLogin, adminController.editCategorOfferPost);

 router.get('/delete-categoryOffer/:id',verifyLogin, adminController.deleteCategorOfferIdGet);

router.get('/delete-product/:id',verifyLogin, adminController.deleteProductIdGet);

router.get('/delete-category/:id',verifyLogin, adminController.deleteCategoryIdGet);

router.get('/changestatus',verifyLogin, adminController.changeStatusGet);

router.post('/change-status',verifyLogin, adminController.changeStatusPost);

router.get('/edit-category/:id',verifyLogin, adminController.editCategoryGet);

router.post('/edit-category/:id',verifyLogin, adminController.editCategoryPost);

router.get('/edit-product/:id',verifyLogin, adminController.editProductGet);

router.post('/edit-product/:id',verifyLogin, adminController.editProductPost);

router.post('/edit-status/:id',verifyLogin, adminController.editStatusPost);

router.get('/admin-dashboard/day', adminController.adminDashboardGetday);

router.post('/admin-dashboard/graphdata', adminController.adminDashboardPostDataGrapgh);

router.get('/sales-report', adminController.getSalesReport);

router.get('/view-details/:id',adminController.getviewdetails);

router.get('/adminlogout', adminController.adminLogOut);


module.exports = router;