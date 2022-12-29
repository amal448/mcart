var db=require('../config/connection')
var collection=require('../config/collection')
const{CATEGORY_COLLECTION }=require('../config/collection');
const { response }=require('../app');
var objectId=require('mongodb').ObjectId


module.exports={ 

addToCart:(proId,userId)=>{

    let proObj={
        item:objectId(proId),
        quantity:1
    }
    return new Promise(async (resolve,reject) =>{
        let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
    if(userCart){
        let proExist=userCart.products.findIndex(product=>product.item==proId)
        console.log(proExist);

        if(proExist!=-1){
            db.get().collection(collection.CART_COLLECTION).updateOne({ user:objectId(userId),'products.item':objectId(proId)},
            {
                $inc:{'products.$.quantity':1}
            }).then(()=>{
                resolve()
            })

            
        }else{
        db.get().collection(collection.CART_COLLECTION)
        .updateOne({user:objectId(userId)},
         {
            
                $push:{products:proObj}
    
         }
         ).then((response)=>{
            resolve()
         })
    }
}
    else{
        let cartObj={
            user:objectId(userId),
            products:[proObj]
        }
        db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
            resolve()
        })

    }
   
   
    })
},
getCartProducts:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match:{user:objectId(userId)}
            },{
                $unwind:'$products'
            },{
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity',
                    
                } 
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product',

                
                }
            },
            {
                 $project:{
                    item:1,quantity:1,product:{ $arrayElemAt:['$product',0]}
                 }
            }
          
        ]).toArray()

        if(cartItems.length==0){
            resolve()
        }else{
        
        resolve(cartItems)
     
        }
    })
},
getCartCount:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let count=0;
        let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
        
        if(cart){
            // count=cart.products.length
            count=cart.products.length
        }
        resolve(count )
    })
},
changeProductQuantity:(details)=>{
     
    details.count=parseInt(details.count)
    details.quantity=parseInt(details.quantity)

    return new Promise((resolve,reject)=>{
        if( details.count==-1 && details.quantity==1){
             db.get().collection(collection.CART_COLLECTION)
        .updateOne({_id: objectId(details.cart), 'products.item': objectId(details.product) },
            {
                $pull: {products:{item:objectId(details.product)}  
            }
            }).then((response) => {
             
                 resolve({status:true})
               
            })
            
        }else{
            db.get().collection(collection.CART_COLLECTION)
            
                .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': details.count }// edu cartaan update cheyuunnathe
                        
                    }).then((response) => {
                        
                        resolve({status:false})
                    })
                    
        }
       
    })
  

},
removeFromCart:(proId, userId)=>{
   console.log(proId);
   console.log('------------------');
   console.log(userId);
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.CART_COLLECTION)
        .updateOne({user: objectId(userId)},
        {

            // $pull:{products: { item:objectId(proId) }}
            $pull: {products:{item:objectId(proId)}}  



        }).then((response)=>{
            console.log(response);
            resolve(response)
        })
    })
},
getTotalAmount:(userId)=>{
    console.log("grrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr")
    console.log(userId)
    return new Promise(async(resolve,reject)=>{
       try{
        let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match:{user: objectId(userId)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                } 
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'

                
                }
            },
            {
                 $project:{
                    item:1,quantity:1,product:{ $arrayElemAt:['$product',0]}
                 }
            },
            {
                $group:{
                    _id:null,
                // total:{$sum:{$multiply:['$quantity','$product.price']}}
               
                // total:{$sum:{$multiply:['$quantity','$product.price']}}
                total:{$sum:{$multiply:['$quantity',{'$toInt':'$product.price'}]}}
            }
           }
        ]).toArray()

     
        // console.log(total.total[0])
        console.log("..............total is...............................")
    
        console.log(total)
        resolve(total[0].total)
    }
    catch{
        resolve(0)
    }
        
    })
},
getCartSubTotal: (userId, proId) => {
    return new Promise(async (resolve, reject) => {
        let cartSubTotal = await db.get().collection('cart').aggregate([
            {
                $match: { user: objectId(userId) }
            },
            {
                $unwind: '$products'
            },
            {
                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity'
                }
            },
            {
                $lookup: {
                    from: 'product',
                    localField: 'item',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $match: {
                    item: objectId(proId)
                }
            },
            {
                $project: {
                    item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                }
            },
            {
                $project: {
                    unitprice: { $toInt: '$product.price' },
                    quantity: { $toInt: '$quantity' }
                }
            },
            {
                $project: {
                    _id: null,
                    subtotal: { $sum: { $multiply: ['$quantity', '$unitprice'] } }
                }
            }
        ]).toArray()
        // console.log(cartSubTotal)
        if (cartSubTotal.length > 0) {
            db.get().collection('cart').updateOne({ user: objectId(userId), "products.item": objectId(proId) },
                {
                    $set: {
                        'products.$.subtotal': cartSubTotal[0].subtotal
                    }
                }).then((response) => {
                    resolve(cartSubTotal[0].subtotal)
                })
        }
        else {
            cartSubTotal = 0
            resolve(cartSubTotal)
        }
    })
},



placeOrder:(order,products,total)=>{
    return new Promise((resolve,reject)=>{
        // console.log(order,products,total,'lllllllllllllllllllllllllllllll') ;
        console.log('ord = ',order);
        console.log('ord = ',order.userId);
        console.log('ordId = ',objectId(order.userId));
        let todayDate=new Date().toISOString().slice(0,10)
        let status=order['payment-method']==='COD' ||order['payment-method'] === 'wallet'
        let orderObj={
            deliveryDetails:{
                homeaddress:order.homeaddress,
                fullAddress:order.fullAddress,
                town:order.town,
                Country:order.country,
                pincode:order.pincode
            },
            userId:objectId(order.userId),
            paymentMethod:order['payment-method'],
            product:products,
            totalAmount:total,
            status:'placed',
            date:new Date(),
            date:todayDate
        }
        db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
            console.log("responsse in cart")
         console.log(response)
            db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)}).then((response)=>{
                if(order['payment-method']=='wallet'){
                    db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(order.userId)},{
                        $push: {
                            walletHistory: {
                                date: new Date(),
                                orderId:objectId(response.insertedId),
                                amount: total,
                                status: "Purchaced from wallet"
                            }
                        },    
                        $inc: { 'wallet': -total }  ,

                      
                        
                       
                    })
                }
            }) 
            console.log('ggggggggggggggggggggggggggggggggggggggggg')
            console.log('responseid:',response.insertedId)
            resolve(response.insertedId)
        })
    })
},



getCartProductList:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        
        // let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
        // resolve(cart.products)

    


        let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})

        if(cart)
        {
        resolve(cart.products)
        }





    })
}



}