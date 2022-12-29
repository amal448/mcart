var db = require('../config/connection')
var collection = require('../config/collection');
const { CATEGORY_COLLECTION } = require('../config/collection');
const { response } = require('../app');
const { ObjectID, ObjectId } = require('bson');
var objectId = require('mongodb').ObjectId




module.exports = {

    getOrderProduct:(userId)=>{
        console.log("I got ordered products...............")
        console.log(userId)
        return new Promise (async(resolve,reject)=>{
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userId)}).sort({_id:-1}).toArray()
            console.log(orders);
            resolve(orders)
        })


    },
    
    getOrderProductList: (orderId) => {
        return new Promise(async(resolve, reject) => {
            let orderItem = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id: ObjectId(orderId)}
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',
                        quantity: '$product.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    },
                    
                },
                {
                    $sort:{_id:-1}
                  }
            ]).toArray()
            console.log();
           resolve(orderItem )
        })
    } ,
    getAllOrders:()=>{
        return new Promise(async(resolve, reject) => {
           
            let allOrders=await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            console.log(allOrders,"alllllllllllllllllll");
            resolve(allOrders)
        })

    },
    getallOrderPage: (pageNo) => {
        return new Promise(async (res, rej) => {
          let users = await db.get().collection(collection.ORDER_COLLECTION).aggregate([        
              {
                $skip: parseInt(pageNo),
              },
              {
                $limit:10,
              },
              {
                $sort:{_id:-1}
              }
            ])
            .toArray();
          res(users);
        });
      },


      getOrderDetails:(id)=>{
        console.log(id,'its id');
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {_id:objectId(id)}
                },
                {
                    $lookup:{
                        from:collection.USER_COLLECTION,
                        localField:'userId',
                        foreignField:'_id',
                        as:'user'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'product.item',
                        foreignField:'_id',
                        as:'orderdetail'
                    }
                },
                {
                    $unwind:'$orderdetail'
                },
                
                {
                    $unwind:'$user'
                },
                {
                    $project:{
                        id:'$orderdetail._id',
                        name:'$orderdetail.Name',      
                        totalAmount:'$orderdetail.price',
            
                        // ordercanceled:'$orders.ordercanceled',
                        Category:'$orderdetail.category',
                        homeaddress:'$deliveryDetails.homeaddress',
                        fulladdress:'$deliveryDetails.fullAddress',
                        town:'$deliveryDetails.town',
                        Country:'$deliveryDetails.Country',
                        pincode:'$deliveryDetails.pincode',
                     
                        status:'$status',
                        // discountPrice:'$orderdetail.offerPrice',
                        payment:'$paymentMethod',
                        category:'$orderdetail.category',
                        image:'$orderdetail._id',
                        email:'$user.email',
                        Nameuser:'$user.name'
                    }
                },
              
            ]).toArray()
            console.log('oooooooop');
            console.log("call from view details in admin..................")
            
             resolve(order)
            
        })
    } ,


getOrderDetail:(orderId)=>{
    return new Promise(async(resolve, reject) => {
        let orderdetail=await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderId)})
        resolve(orderdetail)

    })
},
   // <----------------------------------- Admin ------------------------------------------->
   
   changeOrderStatus:(orderId,status)=>{
    return new Promise(async(resolve, reject) => {
        await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id: ObjectId(orderId)})
    })


   },

   updateStatus:(body,details)=>{
    let {status}= body
    console.log(status)
   return new Promise((resolve,reject)=>{
       if(status=='delivered'||status=='cancelled'){
           db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(details)},
       {
           
           $set:{
               do:true,
               status:status
           }
       }).then((response)=>{
           console.log('hqqqqqhhhh')
           resolve()
           console.log('hhrrrrrrrrhh')
       })
       }else{
           db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(details)},
           {
               
               $set:{
                   status:status
               }
           }).then((response)=>{
               console.log('second')
               resolve()
               console.log('2second')
           }) 
        }
    })
},
   
   deleteOrder: (orderId)=> {
    return new Promise(async(resolve, reject)=> {
       await db.get().collection(collection.ORDER_COLLECTION).deleteOne({_id:ObjectId(orderId)}).then((response) => {
            resolve(response)
       })
    })
}

}

    




