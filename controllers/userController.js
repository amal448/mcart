var express = require('express');
const bcrypt=require('bcrypt');
// var router = express.Router();
const userHelpers=require('../helpers/user-helpers');
var productHelpers=require('../helpers/product-helpers');
const categoryHelpers=require('../helpers/category-helpers')
const paymentHelpers=require('../helpers/payment-helpers')
const adminHelpers=require('../helpers/admin-helpers');
const addressHelpers=require('../helpers/address-helpers');
const cartHelpers=require('../helpers/cart-helpers')
const orderHelpers=require('../helpers/order-helpers')
const wishHelpers=require('../helpers/wish-helpers')
// const { response, locals }=require('../app');
const { response }=require('../app');
// const { json } = require('express');
const {json}=require('../app');
const configTwilio=require('../config/twillio');
const {getCartProductList,getTotalAmount} = require('../helpers/cart-helpers');
const e = require('express');
const productofferHelpers = require('../helpers/productoffer-helpers');
const categoryofferHelpers = require('../helpers/categoryoffer-helpers');
const couponHelpers = require('../helpers/coupon-helpers');
const { startCouponOffer } = require('../helpers/coupon-helpers');
// const client = require('twilio')(configTwilio.accountSID, configTwilio.authToken);

// let dotenv = require('dotenv').config()
// const client = require('twilio')(dotenv.parsed.accountSID, dotenv.parsed.authToken);
// console.log('jejejeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee = ',dotenv.parsed.accountSID);
// console.log('jejejeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee = ',dotenv.parsed.authToken);
require('dotenv').config()
 const serviceSID = process.env.serviceSID
 const accountSID = process.env.accountSID
 const authToken = process.env.authToken
 const client = require('twilio')(accountSID, authToken, serviceSID);


const userController={


  homePage:async (req, res,next) =>{
console.log('jdhdhdhdhhdhddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd');

    console.log('3939393 = ',process.env.serviceSID);
    console.log('3939393 = ',accountSID);
    console.log('3939393 = ',authToken);

    let todayDate = new Date().toISOString().slice(0, 10);
    let startProductOffer = await productofferHelpers.startProductOffer(todayDate)
    let startCategoryOffer=await categoryofferHelpers.startCategoryOffer(todayDate)
   
   
  res.redirect('/user-main')
  },

  home:async(req, res, next)=> {

    let users=req.session.user
    let todayDate = new Date().toISOString().slice(0, 10);
    let startProductOffer=await productofferHelpers.startProductOffer(todayDate)
   let startCategoryOffer= await categoryofferHelpers.startCategoryOffer(todayDate)
    let person=null
    let cartCount=null
    wishCount=null
    if(users){
      person=await userHelpers.getUserDetails(users._id)
       cartCount=await cartHelpers.getCartCount(req.session.user._id)
       wishCount=await wishHelpers.getWishListCount(req.session.user._id)
      }
      let category = await categoryHelpers.getAllCategory()
      
   
      let products=await productHelpers.getAllProducts();
  
       res.render('user/main',{user:true,category,products,users,cartCount,person,wishCount})
     
  },


//users Logins

profileGet:async(req,res)=>{

  let cartCount=null
  let wishCount=null
  users=req.session.user
  let userId=req.session.user._id
   let category=await categoryHelpers.getAllCategory()
  let address=await userHelpers.getAddressDetails()
  if(users){
  let cartCount=await cartHelpers.getCartCount(userId)
  }

  let userAddress=await addressHelpers.getAllAddress(userId)
  let person=await userHelpers.getUserDetails(userId)
  let add=userAddress.address
  res.render('user/profile',{user:true,users,address,cartCount,category,person,add})
  req.session.changePasswordError=false
},

changePasswordPost:async(req,res)=>{
  console.log("Reached at change PasswordPost................")
  let userId=req.session.user._id;
  let enteredPassword=req.body.old;
  let newPassword=req.body.new;
  let confirmPassword=req.body.confirm

  console.log(newPassword,"...........................")
  console.log(confirmPassword,".....................")
  if(newPassword==confirmPassword){
    let userdetails=await userHelpers.getUserDetails(userId)
    bcrypt.compare(enteredPassword,userdetails.password).then((status)=>{
      if (status){
        userHelpers.changePassword(userId,newPassword).then((status)=>{
          req.session.success=true
          res.redirect('/profile')
        })
      }
    })
  }else{
    req.session.changePasswordError="Entered wrong password please enter same Password";
    res.redirect('/profile')
  }
},
userAddressPost:(req,res)=>{
   let userID=req.session.user._id
  addressHelpers.addAddress(userID,req.body).then(()=>{
    res.redirect('/profile')
  })
},

editProfilePost: (req, res) => {
  let userID = req.params.id
  userHelpers.updateProfile(userID, req.body).then(async (data) => {
      try {
          if (req.files.profileImg) {
              let image = req.files?.profileImg
              await image.mv(`./public/product-images/${userID}.jpg`, (err, succ) => {
                  if (err) {
                      console.warn(err)
                  } {
                      console.log('success')
                  }
              })
          }
          res.redirect('/profile')
      }
      catch (err) {
          res.redirect('/profile')
      }
  })
}, 
editUserAddressPost: (req, res) => {
  console.log("I am here to edit Adress..........")
  addressHelpers.editAddress(req.params.id, req.body).then((response) => {
    console.log(req.params.id,"................paramsssssssssssssssssssssssss............................................")
      console.log(req.body);
      res.redirect('/profile')

  })
},
DeleteAddressGet: (req, res) => {
console.log("I am hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
  let userId = req.session.user._id
  console.log(userId)
  let id = req.params.id
  console.log(id,"This is params in deleteAddressGET..................")
  addressHelpers.deleteAddress(userId, id).then((response) => {
      res.redirect('/profile')
  })

},

userLoginGet:function(req,res){
  
  if(req.session.loginIn){
res.redirect('/login')

}else{
  res.render('user/login',{loginErr:req.session.logginErr,otpUserBlock : req.session.blockErr,invalidUser : req.session.invalidUser,blockErr:req.session.blockError});
  req.session.blockErr = false
  req.session.logginErr=false
  req.session.invalidUser = false
  req.session.blockError= false
}
},

userLoginPost: (req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.isblocked){
      req.session.blockErr="user block"
      
      res.redirect('/login')
    }else if(response.status){
      req.session.loginIn=true
      req.session.user=response.user
      console.log(response.user);
      console.log('sesss = ',req.session);
      if(req.session.previousUrl){
       res.redirect(req.session.previousUrl)
      // res.redirect('/user-main')
      } else res.redirect('/')
  }else{
      req.session.logginErr="Invalid username or password"
      res.redirect('/login')
    }
  })
},



 ///////// Users Signup  ///////////////


 userSignupGet:function(req,res,next){
  res.render('user/signup')

},

userSignupPost:(req,res)=>{
  console.log(req.body);

userHelpers.doSignup(req.body).then((response)=>{
   console.log(response)
  if(response.statuss){
    res.redirect('/login') 
  }
  else if(response.password!=response.conformpassword){
    signupErr="The Password entered is Incorrect"
    res.redirect('/signup')
  }else{
    
    signupErr="The email-Id already exists!!"
    console.log('OOOO')
      res.redirect('/signup')
  }
})
},

////////////////   OTP Login  ///////////

otpPageGet:(req,res)=>{    
  res.render('user/Otp',{otpErr:req.session.invalidOtpError})
},

getOtpPost:async (req, res) => {
  // console.log(configTwilio);
  console.log('post worked---------------------')
  let user = await userHelpers.checkMobile(req.body.phone)
  console.log(user,'----------------------------------');
  req.session.temp = user
  await userHelpers.checkMobile(req.body.phone).then((response) => {
    if (user) {
      if (response.blocked) {
        console.log('------------------blocked');
        req.session.otpblockError = "You are blocked by admin"

        res.redirect('/login')
      } else {
        console.log('twilio api----------------------');
        client.verify
          .services(serviceSID)                                             //otp login page post
          .verifications.create({
            to: `+91${req.body.phone}`,
            channel: "sms"
          })
          .then((response) => {
            console.log('response worked---------------------');
            res.render('user/Otp', { phone: req.body.phone })
          }).catch((err) => {

            console.log('error271b = ',err);
          })
      }
    } else {
      console.log('to login ----------------------------');
      req.session.checkMobileErr = "Mobile number not registered"
      res.redirect('/login')
    }
  })
},

submitOtpPost:(req, res) => {
  console.log('190',req.body);
  console.log('ph = ',req.body.phone);
  let phone2 = req.body.phone
  userHelpers.verifyOTP(phone2).then((response)=>{
    let users=req.session.user
    let otp = req.body.otp
    client.verify
      .services(configTwilio.serviceSID)
      .verificationChecks.create({
        to: `+91${phone2}`,
        code: otp
  }).then((data) => {
      if (data.valid) {
        req.session.loginIn=true
        req.session.user = response

        // req.session.user=response.user
        console.log(response.user);
        console.log('sesss = ',req.session);
        res.redirect('/')
      } else {
        req.session.invalidOtpError = "invalid otp"
        res.redirect('/otp')
      }
    })
  })
},


////////// Product detailed view /////////////


productViewGetId: async (req, res) => {   //body yill kodutha  //verify login required

  // console.log("blaaaaaaaaaaaaaaaaaaaaaaaaaaa",req.session.user._id)
  console.log('req sess', req.session);
  console.log("I got it..............productViewGetId.......................................")
  let users = req.session.user
 
  let userss = req.session.user
  console.log("User is:",users);
  // let userss = req.session.user
  req.session.previousUrl = '/view-product/'+req.params.id;
  let id = req.params.id
  console.log(id,"This is image id = ",id)
  let category = await categoryHelpers.getAllCategory()
  let cartCount = null
  let wishCount=null
  let person=null



    if(userss){
    cartCount = await cartHelpers.getCartCount(req.session.user._id)
    wishCount=await wishHelpers.getWishListCount(req.session.user._id)
     person = await userHelpers.getUserDetails(req.session.user._id)
  }
  
  console.log('308');
  // let onePro = await productHelpers.getAllProduct(req.params.id)
  productHelpers.getProductDetails(id).then((product) => {
      res.render('user/view-product', { user: true,userss, product, category,wishCount,person, users, cartCount, zoom: true })
  })
},

productViewGet:async(req,res)=>{

  let category = await categoryHelpers.getAllCategory()
  let products=await productHelpers.getAllProducts(); 
  
   res.render('user/view-product',{user:true,category,products})
 }
,
///////////////////// Cart  ///////////////////////

viewCartGet:async(req,res)=>{
  let users=req.session.user
  let userss=req.session.user
  
  let person=await userHelpers.getUserDetails(userss._id)
  let wishCount=await wishHelpers.getWishListCount(req.session.user._id)
  let cartCount=await cartHelpers.getCartCount(req.session.user._id)
  console.log( req.session.user._id,".......................")
  let products=await cartHelpers.getCartProducts(req.session.user._id)
  console.log(products)
   total=await cartHelpers.getTotalAmount(req.session.user._id)

  let category=await categoryHelpers.getAllCategory()
   const userId=await req.session.user._id
 res.render('user/cart',{products,user:true,cartCount,category,total,userId,users,person,wishCount})
},
       
addToCartGet:async(req,res)=>{                          
  console.log("api call.........................")

  // cartHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    cartHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{

    res.json({status:true})
    //  res.redirect('/')
  })
},

changeProductQuantityPost:async(req,res,next)=>{
  var obj = req.body
  // obj.user= await req.session.user._id
  
  cartHelpers.changeProductQuantity(obj).then(async(response)=>{  
      total =await cartHelpers.getTotalAmount(req.session.user._id)
     //resposnill varunna data convert cheyyunne ennitte json pass cheyyunnu
     response.total = total
     response.subtotals = await cartHelpers.getCartSubTotal(req.session.user._id, req.body.product)
     console.log( response.subtotals)
    res.json(response) //java script object notation object aayi oru data pass cheyan
  })
},

///////wishlist/////

wishListGet: async (req, res) => {
  let users=req.session.user
  let Person=req.session.user
  let person = await userHelpers.getUserDetails(Person._id)
  const userId = await req.session.user._id
  let cartCount=await cartHelpers.getCartCount(req.session.user._id)
  let wishCount=await wishHelpers.getWishListCount(req.session.user._id)
  let category = await categoryHelpers.getAllCategory()
  let product = await wishHelpers.getWishListProducts(req.session.user._id)
  res.render('user/wish-list', { user: true, product, users,person,userId,category,wishCount,cartCount})
},

addToWishListGet: (req, res) => {
  wishHelpers.addToWishlist(req.params.id, req.session.user._id).then((wishlist) => {
    if (wishlist.length > 0) {
      if (res.wishlist) {
        console.log('jhjhjhjhhjhj')
        res.json({ status: true, wishlist: true })

      } else {
        res.json({ status: true, wishlist: false })
      }
    }

  })
},


WishListRemoveGet:  (req, res) => {
  wishHelpers.removeWishListProduct(req.params.id, req.session.user._id).then((response) => {
    res.json({ status: true })
  })
},


 //////////////// Order //////////////////////


 placeOrderGet:async(req,res)=>{
  let todayDate=new Date().toISOString().slice(0,10)
  let total=await cartHelpers.getTotalAmount(req.session.user._id)
  let wishCount=await wishHelpers.getWishListCount(req.session.user._id)
  address=await addressHelpers.getAllAddress(req.session.user._id)                              //use 
  alladdress=address.address
  // let person =req.session.user._id
  let user=req.session.user._id
  let person=await userHelpers.getUserDetails(req.session.user._id)
  let wallet=false
  if(total <= person.wallet){
    wallet=true
  }
  product=await categoryHelpers.getAllCategoryProduct(req.params.id)
  console.log(req.params.id,"This is params id......")
   cartsProducts=await cartHelpers.getCartProducts(req.session.user._id)
    console.log(cartsProducts,"..............................")
   category=await categoryHelpers.getAllCategory()
  eachAddress=await addressHelpers.getAddressbyId(req.session.user._id)
  let cartCount=await cartHelpers.getCartCount(req.session.user._id)
  let startCouponOffer=await couponHelpers.startCouponOffer(todayDate)


  // startCouponOffer

res.render('user/place-order',{user:true,category,wallet,eachAddress,total,alladdress,person,user,cartsProducts,cartCount,startCouponOffer,wishCount})
},

placeOrderPost:async(req,res)=>{ 
  let todayDate=new Date().toISOString().slice(0,10)
  console.log("this is post..........")
  let  products=await getCartProductList(req.session.user._id)
  console.log(req.body);

  console.log("hoiiiiii ",req.body);
  
  
  totalPrice = parseInt(req.body.gTotal)
  
  console.log('tttttt = ',totalPrice);
  console.log(totalPrice,"hkkkkkkkkkkkkkkkkkkkkkoiiiiii");
  cartHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
   console.log(orderId,'cod');
   if(req.body['payment-method']==='COD' || req.body['payment-method'] === 'wallet'){   
    res.json({codStatus:true})
   }
   else if(req.body['payment-method']==='paypal'){
   paymentHelpers.genaretePaypal(orderId,totalPrice).then((link)=>{
    paymentHelpers.changePaymentStatus(orderId).then(()=>{
      res.json({link,paypal:true})
    })
  })
   }else if (req.body['payment-method'] == 'razorpay') {
    paymentHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
      console.log("5504")
        console.log(response, 'responsee');
        console.log(orderId, "ordeereeee");
        res.json(response)
    })
}

  })
},
verifyPaymentPost: (req, res) => {

  paymentHelpers. verifyPayment(req.body).then(() => {
      console.log(req.body, 'reeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeq.body in verifypayment')
      paymentHelpers.changePaymentStatus(req.body.order.receipt).then(() => {
          console.log('success full');
          res.json({ status: true })


      })
  }).catch((err) => {
      console.log(err, 'is the error in the user.js verify payment');
      res.json({ status: false, erMsg: 'payment failed' })
  })

},


myOrderGet:async(req,res)=>{
  
    let users=req.session.user._id   
    let wishCount=await wishHelpers.getWishListCount(req.session.user._id)
    let person= await userHelpers.getUserDetails(req.session.user._id)
 
 
  let category=await categoryHelpers.getAllCategory()
  let cartCount=await cartHelpers.getCartCount(req.session.user._id)
  let products=await productHelpers.getProductDetails()
  console.log(products,"........this is product in my order")
  
  let order=await orderHelpers.getOrderProduct(req.session.user._id)
  console.log(users._id)
  console.log('...order in get...',order) ;
  order.forEach(element=>{
    if (element.status=="delivered"){
      element.delivered=true;
    }
    else if (element.status=="cancelled"){
      element.cancelled=true;
    } else if (element.status=="returned"){
      element.returned=true
    
    }
  })
  
  res.render('user/my-orders',{users,person,category,cartCount,order,user:true,wishCount})
  },

  

  cancelOrderIdGet:(req,res)=>{
    let orderId=req.params.id;
    console.log((orderId),"////////////////////")
    let id=req.session.user._id;
    userHelpers.orderCancel(req.params.id,id).then(()=>{
     
       
     res.redirect('/myorders')
    })
  },

returnOrderIdGet:(req,res)=>{
  userHelpers.orderReturn(req.params.id).then(()=>{
    res.redirect('/myorders')
  })
},


  removeFromCartGet:(req,res)=>{
 
    cartHelpers.removeFromCart(req.params.id,req.session.user._id).then((response)=>{
     
      res.json({status:true})
    })
  },
  paymentSuccesGet:(req,res)=>{
    res.render('user/payment-success')
  },

  orderedproductGet:async(req,res)=>{

    let users=req.session.user
    let person=await userHelpers.getUserDetails(users._id)
    let cartCount=await cartHelpers.getCartCount(req.session.user._id)
    let category=await categoryHelpers.getAllCategory()
    let orderId=req.params.id
    console.log("This is a params.id.....",orderId)
    let orderItems=await orderHelpers.getOrderProductList(orderId)
    console.log(orderItems)
     let orders=await orderHelpers. getOrderDetail(orderId)
    console.log("Sireeeeee this is orders on user............") 
    console.log(orders)
    res.render('user/ordered-product',{orderItems,user:true,users,category,zoom:true,cartCount,person,orders})
 
 },
 addressGet:async(req,res)=>{

  res.render('user/address',{user:true,total})
}
,



/////////////edited below/////////////



addressPost:async(req,res)=>{
   let userID=req.session.user._id
    // let userID=req.session.userId
  console.log(userID,"...this is userID....")
  console.log(".......address post......")
  addressHelpers.addAddress(userID,req.body).then(()=>{
    res.redirect('/place-order')
  })
},


viewWalletHistory: async (req, res) => {
  try {
      console.log('hii');

      let userId = req.session.user._id
      let user = await userHelpers.getUserDetails(userId)
      if (user.walletHistory == undefined) {
        console.log("If akath keerunundo?");
          user.walletHistory == false
      } else {
          user.walletHistory.forEach(element => {
              let a = element.date.toISOString().split('T')[0]
              console.log(a);
              element.date = a;
          });
      }
      console.log(user.walletHistory, 'oooooo');
      user.walletHistory = user.walletHistory.reverse() 

      console.log(user, 'userrrrrrrrr');
      let users = req.session.user
      let userss = req.session.user
      let person = await userHelpers.getUserDetails(userss._id)
      let category = await categoryHelpers.getAllCategory()
      let cartCount = await cartHelpers.getCartCount(req.session.user._id)
      res.render('user/walletHistory', { user: true, user, userss, person, category, users, cartCount })
  } catch (error) {
      console.log(error);
      res.redirect('/profile')

  }
},
wrongGet: async (req, res) => {
  res.render('user/profile')
},

///////////////////////////Wishlist////////////////////////////////

logOutGet:(req,res)=>{
  // req.session.user=null
   req.session.destroy()
   
  //  res.redirect('/login')
  res.redirect('/user-main')

 }
,


filter1:(async(req,res)=>{
  let filter = req.query.filterby
  console.log('ffff = ',filter);
 req.session.previousUrl = '/filter?filterby='+filter
 users=req.session.user
 let userId=null
   let person=null
   let cartCount=null
   let wishCount=null
   category = await categoryHelpers.getAllCategory(userId)

 if(users){
   userId=req.session.user._id
  person=await userHelpers.getUserDetails(userId)
  cartCount=await cartHelpers.getCartCount(userId)
  wishCount=await wishHelpers.getWishListCount(userId)
 }
 await userHelpers.filterFunction(filter).then((response) => {
   let filtered = response
   console.log(filtered)
   // res.render('user/shop', { filtered, user: req.session.user,  })
   res.render('user/filter',{filtered,user:true,wishCount,category,users,cartCount,person})
 })
}),

///////couponApply

postApplyCoupon:(async(req,res)=>{

  let couponCode=req.body.coupon
  console.log(req.body.coupon);

  let userId=req.session.user._id
  let totalAmount=await cartHelpers.getTotalAmount(userId);


   await couponHelpers.validateCoupon(couponCode,userId,totalAmount).then((response)=>{
    req.session.couponTotal=response.total

    if(response.success){
      console.log("Hello from validCouponnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn.............................")
      console.log(response);
    console.log("Hello from validCouponnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn.............................")
      
       res.json({couponSuccess:true,total:response.total,discountValue:response.discountValue,couponCode})
   
    }else if (response.couponUsed) {
      res.json({ couponUsed: true })
    } else if (response.couponExpired) {
      res.json({ couponExpired: true })
    } else {
      res.json({ invalidCoupon: true })
    }
  })
})


}

module.exports = userController;









































