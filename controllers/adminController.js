var express = require('express');
const { render, response } = require('../app');
const userHelpers = require('../helpers/user-helpers');
const adminHelpers=require('../helpers/admin-helpers')
var productHelpers=require('../helpers/product-helpers')
var categoryHelpers=require('../helpers/category-helpers')
const cartHelpers=require('../helpers/cart-helpers')
var orderHelpers=require('../helpers/order-helpers')
var productofferHelpers=require('../helpers/productoffer-helpers')
var categoryofferHelpers=require('../helpers/categoryoffer-helpers')
const couponHelpers=require('../helpers/coupon-helpers')
const moment = require('moment')
var db = require('../config/connection')
var collection = require('../config/collection');
var objectId = require('mongodb').ObjectId
const adminController={


 ///////check Admin Logged Credentials //////////////

  

/////////////////Main Page//////////////
 
mainPageGet: async function(req, res, next) {
  console.log('1999999');

  let Users=await userHelpers.totUsers()
  let Products=await userHelpers.totProducts()
  let Orders=await userHelpers.totOrders()  
  let Revenue=await adminHelpers.graphdata()
  console.log('users ',Users);
  console.log('pra ',Products);
  console.log('Orders ',Orders);
  // console.log('ewc ',Revenue.monthlySales[0].total);
  // console.log('ewc ',Revenue.yearlySales[0].total);
  
  try {
    console.log('ewc ',Revenue.dailySales);
    revenueDaily =   Revenue.dailySales[0].total
    revenueTotal   =   Revenue.totalSales[0].total
    revenueWeekly =   Revenue.weeklySales[0].total
    revenueMonthly =   Revenue.monthlySales[0].total
    revenueYearly   =   Revenue.yearlySales[0].total
    
  } catch (error) {
    revenueDaily  = 0
    revenueTotal  = 0
    revenueWeekly = 0
    revenueMonthly  = 0
    revenueYearly = 0
  }

  // let revenue =Revenue.yearlySales[0].total




    if(req.session.adminLoggedIn){
    res.render('admin/dashboard',{admin:true,Users,Products,Orders,Revenue,revenueWeekly,revenueMonthly,revenueYearly,revenueDaily,revenueTotal});
    }else{
      res.redirect('/admin/admin-login')
    }
  },

///////////// Admin Login////////////

adminLoginGet:(req,res,next)=>{
    if(req.session.adminLoggedIn){
      res.redirect('/admin')
    }else{
      res.render('admin/login-admin')
      req.session.adminLoginError = null
    }
      
    },

  adminLoginPost:function(req,res){
    const credentials = {
      email: "admin@gmail.com",
      password: "admin"
    }
        console.log(req.body);
        if(req.body.Email == credentials.email && req.body.Password == credentials.password){
          console.log('admin logged in');
          req.session.adminLoggedIn = true;
          req.session.admin = req.body.email;
          console.log(req.session);
          res.redirect('/admin');
          console.log(req.session);
        }else{
          console.log("admin not logged in");
          req.session.adminLoginError=true
          res.redirect('/admin')
        }
      },
      
    /////////// View Products,User,Category,Order  ///////////////////////////


ViewProductGet:async(req,res)=>{
  // let pageNo = (Number(req.params.id) - 1) * 10;
  let pageNo = (Number(req.params.id) - 1) * 10;
  console.log(req.params.id)
  console.log("jajajajajajajajajaj")
  console.log(pageNo)
  let passNo = req.params.id;
  console.log(passNo)
  
   totalCount= await productHelpers.getAllProducts()
  // console.log(totalCount,"gegegegegegegegege")
   Count=totalCount.length
   console.log(Count,"hahrahahahahaha")
   total=Count/10
   console.log(total,"jajajajajajshdhdhdhhddhbbcdcbdsidcs")

  limit= Math.ceil(total)
  console.log(limit)
  productHelpers.getAllProductsPage(pageNo).then((products)=>{
     res.render('admin/view-product',{admin:true,products,passNo,limit })
   
   })
 
  },
 
 ViewUserGet:(req,res)=>{
  let pageNo = (Number(req.params.id) - 1) * 3;
  let passNo = req.params.id;
 
   userHelpers.getAllUsersPage(pageNo).then((users)=>{

     res.render('admin/view-user',{admin:true,users,passNo})
   })
   
 },
 
 
  
  ViewCategoryGet: async (req, res)=>{
    let pageNo = (Number(req.params.id) - 1) * 4;
    let passNo = req.params.id;
 
    console.log('hcyhgkk');
    categoryHelpers.get_category_listPage(pageNo).then((category)=>{
      res.render('admin/view-category',{admin:true,category,pageNo,passNo})
    })
   },
 
  
  ViewOrderGet:async(req, res)=>{
    // let pageNo = (Number(req.params.id) - 1) * 10;

    let pageNo = (Number(req.params.id) - 1) * 10;
    let passNo = req.params.id;
    let order = await orderHelpers.getOrderDetails()
    
   orderHelpers.getallOrderPage(pageNo,passNo).then((orderList) => {
     orderList.forEach(element => {
       if (element.status == "delivered") {
         element.delivered = true;
       } else if (element.status == "cancelled") {
         element.cancelled = true;


       }else if (element.status == "returned"){
         element.returned = true;
       }
     });



     res.render('admin/view-order', { admin: true ,orderList,passNo,user:false,issue:false})
   })
   
  },


///////////Adding(Category,Products)/////////////


 addCategoryGet:(req,res)=>{
  res.render('admin/add-category',{admin:true})
},

  addCategoryPost:(req,res)=>{
    console.log(".........",req.body);
    categoryHelpers.add_category(req.body).then((response)=>{

      if(response.status){
      res.redirect('/admin/view-category/1')
     }
     else{
        signupErr="The Category already exists! "     
        res.redirect('/admin/view-category/1')
      }
    })
  },


 addProductGet:async(req,res)=>{
let category=await categoryHelpers.get_category_list()
  res.render("admin/add-product",{admin:true,category})
 },


  addProductPost:function(req,res){
    console.log(req.body);
    
    const prdDetails={
      Name:req.body.Name,
      price:req.body.price,
      description:req.body.description,
      stock:req.body.stock,
      category:req.body.category,
      image:req.files.image.name,
      image1:req.files.image1.name,
      image2:req.files.image2.name,
      image3:req.files.image3.name,
      // categOffer:false,
      // proOffer:false,
      
    }
    
    productHelpers.addProduct(prdDetails).then((data)=>{               //result
        let image=req.files.image;
        let image1=req.files.image1;
        let image2=req.files.image2;
        let image3=req.files.image3;
        
      console.log('image=',image)
      image.mv(`./public/product-images/${data}.jpg`,(err,done)=>{
      
      })
      image1.mv(`./public/product-images/${data}1.jpg`,(err,done)=>{
      
    })
    image2.mv(`./public/product-images/${data}2.jpg`,(err,done)=>{
      
    })
    image3.mv(`./public/product-images/${data}3.jpg`,(err,done)=>{
      
    })
     res.redirect('/admin/view-product/1')
    })
   },

    /////////Product Offer/////////

    addProductOfferGet:async(req,res)=>{
      try{
        let product=await productHelpers.getAllProducts();
        let AllProductOffer=await productofferHelpers.getAllProductOffer();
        console.log(product,'..........Call From addProductOfferget...........................');
        console.log("................below is productoffer..........")
        console.log(AllProductOffer)
      res.render('admin/add-productoffer',{admin:true,product,AllProductOffer})

    } catch (error){
      console.log('something wrong in ')
    }
  },
addProductOfferPost:(req,res)=>{
try{
  productofferHelpers.addProductOffer(req.body).then(()=>{
    console.log('addproductoffer is here....... ')
    console.log(req.body,'');

    res.redirect('/admin/add-productoffer')
  });
} catch (error) {
  console.log('something wrong in add product offer');
}
},
editProductOfferGet:async(req,res)=>{
  try{

    let proOfferId=req.params.id;
    console.log('id ===== ',proOfferId);
    let proOfferDetails=await productofferHelpers.getProductOfferDetails(proOfferId);
    console.log(proOfferDetails," this is proofeerdeetailsssssssss.......")
    let product=await productHelpers.getAllProducts()
  res.render("admin/edit-productoffer",{admin:true,proOfferDetails,product})
  }catch(error){
    console.log('something wrong in editProduct.......')
  }
},

editProductOfferPost:(req,res)=>{
  try{
    let proOfferId=req.body.id
    console.log(req.body,'kkkk')
    console.log(proOfferId,'llllllll');
    productofferHelpers.editProdOffer(proOfferId,req.body).then(()=>{
      res.redirect("/admin/add-productoffer")
    })
  } catch (error){
    console.log('something wrong in',)
    res.send('erro = ',error)
  }
},

deleteProductOfferGet:(req,res)=>{
  try{
    let proOfferId=req.params.id;
    productofferHelpers.deleteProdOffer(proOfferId).then(()=>{
      res.redirect("/admin/add-productoffer")
    });
  } catch (error){
    console.log("something wrong in")
  }
},

//////////////CATEGORY OFFERS /////////////

addCategoryOfferGet:async(req,res)=>{
  console.log("100")
  try{
     let category=await categoryHelpers.getAllCategory()
     let alloffercategory=await categoryofferHelpers.getAllCatOffers()
    res.render('admin/add-categoryoffer',{admin:true,category,alloffercategory})
    console.log("101")
  } catch(error){
    console.log('something wrong in add category get')
  }
},

addCategoryOfferPost:(req,res)=>{
  try{
    console.log("102")
    categoryofferHelpers.addCategoryOffer(req.body).then(()=>{
       res.redirect('/admin/add-categoryoffer')
    }).catch(()=>{
      req.session.offerExist = "offer for this category is already added"
      res.redirect('/admin/add-categoryoffer')
    })
  }catch(error){
    console.log("something wrong in add category")
  }
},

editCategoryOfferGet:async(req,res)=>{
  let CatOfferId=req.params.id;
  console.log('id ===== ',CatOfferId);
  try{
    let data= await categoryofferHelpers.getCatOfferDetails(CatOfferId)
    let category= await categoryHelpers.getAllCategory()
    console.log(category)
  res.render('admin/edit-categoryoffer',{admin:true,data,category})

  }catch (error) {
    console.log('somthing wrong in  ');

}  

}
,
editCategorOfferPost:(req,res)=>{
  try{
     let id=req.params.id
    console.log(req.body,'kkkk')
     console.log(req.body.id,'llllllll');
    categoryofferHelpers.updateCatOffer(req.body.id,req.body).then(()=>{
      res.redirect("/admin/add-categoryoffer")
    })
  } catch (error){
    console.log('something wrong in editCategoryofferpost')
    // res.send('erro = ',error)
  }
},

deleteCategorOfferIdGet:(req,res)=>{
  let catoffId=req.params.id
 
  console.log(catoffId)
  categoryofferHelpers.deleteCatOffer(catoffId).then((response)=>{
   
    res.redirect('/admin/add-categoryoffer')
  })
},

    //////////coupon////////////////

getlistCoupon: async(req,res)=>{
   let allcoupons=await couponHelpers.getAllCoupons()
  res.render('admin/view-coupon',{admin:true,allcoupons })
},
getAddCoupon:(req,res)=>{
  res.render('admin/add-coupon',{admin:true})
},
postAddCoupon:(req,res)=>{

  console.log(req.body,'fffffff');
  couponHelpers.addCoupon(req.body).then(()=>{
    res.redirect('/admin/view-coupon')
  })
},
geteditCoupon:(async(req,res)=>{
  let couponId=req.params._id
  let couponDetails=await couponHelpers.getCouponDetails(couponId)
  res.render('/admin/view-coupon',{admin:true,couponDetails})
})
,
posteditcoupon:(async(req,res)=>{
  let couponId=req.params._id
  let data=req.body
  couponHelpers.editCoupon(data,couponId).then(()=>{
    console.log("Edited Successfully")
    res.redirect('/admin/view-coupon')
  })
}),
deleteCoupon:(req,res)=>{
  console.log("723455555555555555555555555555555555555555555555553828")
  let couponId=req.params.id
  console.log("blablaaaaaaaaaaa")
  console.log(couponId)
  couponHelpers.deletecoupon(couponId).then(()=>{
    res.redirect('/admin/view-coupon')
  })
},


      ////Deleting & blocking(User,Products,Category)

  
deleteProductIdGet:(req,res)=>{
    let proId=req.params.id
    console.log(proId);
    productHelpers.deleteProduct(proId).then((response)=>{
      res.redirect('/admin/view-product/1')
    })
  },
  
  deleteCategoryIdGet:(req,res)=>{
    let proId=req.params.id
    console.log(proId);
    categoryHelpers.delete_category(proId).then((response)=>{
      res.redirect('/admin/view-category/1')
    })
  },
  
  changeStatusGet:(req, res) => {
    console.log('hhhhhhhhhh')
    productHelpers.changeStatus(req.query.id).then((response) => {
      console.log(req.query.id,"...........req.query.id.........")
      admin__msg = response
      res.redirect('/admin/view-user/1')
    })
  },
  
  changeStatusPost:(req,res)=>{
    // res.render('admin/view-order')
    res.render('admin/view-order/1')
  },
  

/////////////Editing(Category,Products)/////////

editCategoryGet: async(req,res)=>{
 
    console.log('here here')
   
   let category=await categoryHelpers.getCategoryDetails(req.params.id)
   
    console.log(req.params.id)
    console.log(category);
    res.render('admin/edit-category',{category,admin:true})
    admin_msg=''
    },
  
    editCategoryPost: (req,res)=>{
      console.log(req.body,"out said");
      categoryHelpers.updateCategory(req.params.id,req.body).then((response)=>{
        console.log(req.body);
        res.redirect('/admin/view-category/1')
      })
    },
  
    editProductGet:async(req,res)=>{
      console.log("hereteyeye")
      let product=await productHelpers.getProductDetails(req.params.id)
      let category=await categoryHelpers.get_category_list()
      // console.log(req.params.id)
      // console.log(product);
      res.render('admin/edit-product',{product,category,admin:true})
    },
  
    editProductPost:(req,res)=>{
      let data=req.params.id
      productHelpers.updateProduct(data,req.body).then(async(response)=>{
        try{
          if(req.files.image){
          console.log("555555555555555555555555555555555555555555555555555555555555555")
          let image=req.files?.image
          await image.mv(`./public/product-images/${data}.jpg`,(err,succ)=>{
           if(err) {
            console.warn(err)
           }{
            console.log('success')
           }
          })
        }
        if(req.files.image1){
            let image1=req.files?.image1
            await image1.mv(`./public/product-images/${data}1.jpg`,(err,succ)=>{
             if(err) {
              console.warn(err)
             }{
              console.log('success')
             }
            })
          }
          if(req.files.image2){
            let image2=req.files?.image2
            await image2.mv(`./public/product-images/${data}2.jpg`,(err,succ)=>{
             if(err) {
              console.warn(err)
             }{
              console.log('success')
             }
            })
          }
          if(req.files.image3){
            let image3=req.files?.image3
            await image3.mv(`./public/product-images/${data}3.jpg`,(err,succ)=>{
             if(err) {
              console.warn(err)
             }{
              console.log('success')
             }
            })
          }
     
    
        res.redirect('/admin/view-product/1')
       }
       catch(err) {
        res.redirect('/admin/view-product/1')
       }
        
       })
     },
  
    editStatusPost:async(req, res) => {
      console.log("userrrrrrrrr id in admin statuspost")
      console.log(req.body)
      console.log(req.params.id)
     
      adminHelpers.productStatus(req.params.id, req.body.status).then((orderId) => {
      
        console.log(req.params.id,".......req.params.id...." )
        console.log(req.body.status)
        res.redirect('/admin/view-order/1')
      })
    },
   

  
    ///////////////////DashBoard/////////////////////////////////

    adminDashboardGet: async (req, res) => { //verifyLogin1
      console.log("admindash is hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
      let Users = await userHelpers.totUsers()
      let Products = await userHelpers.totProducts()
      let Orders = await userHelpers.totOrders()

      console.log('jjjjjjjjjjjjjjjjj')

      res.render('admin/dashboard', { admin: true, Users, Products, Orders })

  },

  adminDashboardGetday: async (req, res) => {
      console.log('nnnnnnnnnnnnnnnnnnnnnnn')

      await adminHelpers.findOrdersByDay().then((data) => {
          res.json(data)
      })
  },

  adminDashboardPostDataGrapgh: async (req, res) => {
      console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')

      await adminHelpers.graphdata().then((data) => {
          console.log(data, 'jooooooo');
          res.json({ data })
      })
  },


  getSalesReport: async (req, res) => {
    try{
     
        let myorder = await orderHelpers.getAllOrders()
      
console.log('yorde = ',myorder);
          res.render('admin/sales-report', { myorder, admin: true, print:true })
      }

  // }
   catch (error) {
    console.log('somthing wrong in.................................................................................................. ');

}
  }
  ,
  getviewdetails: async (req, res) => {
    console.log("sireeeeeeeeeeeeeeeeeeeeeeeeeeeee")
    console.log(req.params.id)
    let order = await orderHelpers.getOrderDetails(req.params.id)
    console.log("ALL ORDERS IN GETVIEW............................................")
    console.log(order);
    res.render('admin/view-details', { order,admin:true })
  },

  

//Admin LogOut/////////////////

  adminLogOut:(req,res)=>{
    console.log('aaa')
    req.session.admin=null
    req.session.adminLoggedIn= null
    req.session.adminLoginError=null
    // req.session.adminLoginError=null
    res.redirect('/admin/admin-login')
  },
     
        ////////////////////code for pagination


  adminUserManagementGet: (req, res, next) => {
    let pageNo = (Number(req.params.id) - 1) * 10;
    let passNo = req.params.id;

    adminOpt.getAllUsers(pageNo).then((response) => {
      res.render("admin/adminUsersList", {
        user: false,
        issue: false,
        response,
        passNo,
      });
    });
  },

}

module.exports=adminController;









