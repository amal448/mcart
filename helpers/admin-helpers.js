var db=require('../config/connection')
var collection=require('../config/collection')
const {CATEGORY_COLLECTION }=require('../config/collection')
const{ response }=require('../app');
var objectId=require('mongodb').ObjectId


module.exports={

    getalluser:()=>{
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(user)
        })
    },
  
    productStatus: (orderId, proStatus) => {
        let status = proStatus
       console.log("THIS IN STATUS......")
       console.log(status)
        return new Promise(function (resolve, reject) {
            db.get().collection(collection.ORDER_COLLECTION).findOneAndUpdate({ _id: objectId(orderId) }, {
                $set: {
                    status: status
                }
            }
          
        ).then((response) => {
            console.log("thengaaaaaa")
            console.log(response);
            console.log("kiiiiiiiiiiiiiiiity")
                if(status=='cancelled'){
                    db.get().collection(collection.USER_COLLECTION).findOneAndUpdate({_id:objectId(response.value.userId)},{
                        $push: {
                            walletHistory: {
                                date: new Date(),
                                orderId:objectId(response.value.orderId),
                                 amount: response.value.totalAmount,
                                status: "Returned Credit to Wallet"
                            }
                        },    
                       $inc: { 'wallet': response.value.totalAmount } ,
                        
                    })
                  
                }
                console.log(".,..,.,......,.,.,.,..,...,..,.")
                console.log(response.value.totalAmount )
                console.log(response)
                // resolve(orderId)
                resolve()
            })
        })
    
    },
    findOrdersByDay: () => {
        return new Promise(async (resolve, reject) => {
            console.log('gggggg')
    
            let data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
    
                {
                    $match: {
                        date: {
                            $gte: new Date(new Date() - 60 * 60 * 24 * 1000 * 13)
                        }
                    }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                        day: { $dayOfMonth: "$date" },
                        dayOfWeek: { $dayOfWeek: "$date" },
                    }
                },
                {
                    $group: {
                        _id: '$day',
                        count: { $sum: 1 },
                        detail: { $first: '$$ROOT' }
                    }
                },
                {
                    $sort: { detail: 1 }
                }
            ]).toArray()
            console.log(data, ' is the data');
    
            resolve(data)
        })
    },
    
    graphdata: () => {
        return new Promise(async (resolve, reject) => {
    
    
            //   WeeklySales
            var dailySales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                { $match: { status: "delivered" } },
                {
                    $project: {
                        date: { $convert: { input: "$_id", to: "date" } }, total: "$totalAmount"
                    }
                },
                {
                    $match: {
                        date: {
                            $lt: new Date(), $gt: new Date(new Date().getTime() - (24 * 60 * 60 * 1000 ))
                        }
                    }
                },
                {
                    $group: {
                        _id: { $dayOfWeek: "$date" },
                        total: { $sum: "$total" }
                    }
                },
                {
                    $project: {
                        date: "$_id",
                        total: "$total",
                        _id: 0
                    }
                },
                {
                    $sort: { date: 1 }
                }
            ]).toArray()
    
            console.log('107 da ',dailySales[0]);

            //   WeeklySales
            var weeklySales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                { $match: { status: "delivered" } },
                {
                    $project: {
                        date: { $convert: { input: "$_id", to: "date" } }, total: "$totalAmount"
                    }
                },
                {
                    $match: {
                        date: {
                            $lt: new Date(), $gt: new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 7))
                        }
                    }
                },
                {
                    $group: {
                        _id: { $dayOfWeek: "$date" },
                        total: { $sum: "$total" }
                    }
                },
                {
                    $project: {
                        date: "$_id",
                        total: "$total",
                        _id: 0
                    }
                },
                {
                    $sort: { date: 1 }
                }
            ]).toArray()
    
            console.log('107 ',weeklySales[0]);
    
            // monthly Sales
            var monthlySales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                { $match: { status: "delivered" } },
                {
                    $project: {
                        date: { $convert: { input: "$_id", to: "date" } }, total: "$totalAmount"
                    }
                },
                {
                    $match: {
                        date: {
                            $lt: new Date(), $gt: new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 365))
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$date" },
                        total: { $sum: "$total" }
                    }
                },
                {
                    $project: {
                        month: "$_id",
                        total: "$total",
                        _id: 0
                    }
                }
            ]).toArray()
    
            console.log('139 ',monthlySales);
    
    
            // Yearly Sales
            var yearlySales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                { $match: { status: "delivered" } },
                {
                    $project: {
                        date: { $convert: { input: "$_id", to: "date" } }, total: "$totalAmount"
                    }
                },
    
                {
                    $group: {
                        _id: { $year: "$date" },
                        total: { $sum: "$total" }
                    }
                },
                {
                    $project: {
                        year: "$_id",
                        total: "$total",
                        _id: 0
                    }
                }
            ]).toArray()
    
            // Total sales
            var totalSales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                { $match: { status: "delivered" } },
                {
                    $project: {
                        date: { $convert: { input: "$_id", to: "date" } }, total: "$totalAmount"
                    }
                },
    
                {
                    $group: {
                        _id: { $year: "$date" },
                        total: { $sum: "$total" }
                    }
                },
                {
                    $project: {
                        year: "$_id",
                        total: "$total",
                        _id: 0
                    }
                }
            ]).toArray()
    
            console.log('166 ',totalSales);
            resolve({ weeklySales, monthlySales, yearlySales, totalSales,dailySales })
    
        })
    },
    //ales report
    salesReport: () => {
    
        return new Promise(async (resolve, reject) => {
    
            var totalUsers = await db.get().collection(collection.USER_COLLECTION).count();
    
    
            // Total Delivered Orders & today Revenue
            var TodayrevenueAndDelevered = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { status: "delivered" }
                },
                {
                    $project: {
                        date: { $convert: { input: "$_id", to: "date" } }, order: 1, deliveryDetails: 1
                    }
                },
                {
                    $match: {
                        date: { $lt: new Date(), $gt: new Date(new Date().getTime() - (24 * 60 * 60 * 1000)) }
                    }
                },
    
                {
                    $group: {
                        "_id": "tempId",
                        "todayRevenue": {
                            "$sum": { "$sum": "$total" }
                        },
                        "todaytotalOrders": {
                            "$sum": { "$sum": "$product.quantity" }
                        }
                    }
                }
            ]).toArray()
    
            // Total Sale Price
            // Total Order Count
            var totalSale = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $group: {
                        "_id": "tempId",
                        "totalSale": {
                            "$sum": { "$sum": "$total" }
                        },
                        "totalOrders": {
                            "$sum": { "$sum": "$product.quantity" }
                        }
                    }
                }
            ]).toArray()
    
    
            // Total Delivered Sale Price
            // Total Delivered Order Count
            var deliveredTotalSale = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { status: "delivered" }
                },
                {
                    $group: {
                        "_id": "tempId",
                        "totalRevenue": {
                            "$sum": { "$sum": "$total" }
                        },
                        "totalDelivered": {
                            "$sum": { "$sum": "$product.quantity" }
                        }
                    }
                }
            ]).toArray()
    
    
    
            // today Order Quantity todaytotalOrders
            var todayOrders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                
                {
                    $project: {
                        date: { $convert: { input: "$_id", to: "date" } }, order: 1, deliveryDetails: 1
                    }
                },
                {
                    $match: {
                        date: { $lt: new Date(), $gt: new Date(new Date().getTime() - (24 * 60 * 60 * 1000)) }
                    }
                },
    
                {
                    $group: {
                        "_id": "tempId",
                        "todaySales": {
                            "$sum": { "$sum": "$total" }
                        },
                        "todaytotalOrders": {
                            "$sum": { "$sum": "$product.quantity" }
                        }
                    }
                }
            ]).toArray()
            console.log(todayOrders,"he;lo");
    
    
    
    
            resolve({ data: totalSale[0], totalUsers: totalUsers, todayOrders: todayOrders[0], deliveredTotalSale: deliveredTotalSale[0], TodayrevenueAndDelevered: TodayrevenueAndDelevered[0] })
        })
    
    },
    getOrderDetails:(id)=>{
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id:objectId(id)}
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
                        name:'$orderdetail.productname',      
                        totalAmount:'$orderdetail.price',
                        // ordercanceled:'$orders.ordercanceled',
                        status:'$status',
                        // discountPrice:'$orderdetail.offerPrice',
                        payment:'$paymentMethod',
                        category:'$orderdetail.category',
                        // image:'$orderdetail._id',
                        email:'$user.email',
                        Nameuser:'$user.name',
                        city:'$deliveryDetails.town',
                        address:'$deliveryDetails.homeaddress',
                        pincode:'$deliveryDetails.pincode',
                    }
                },
                {
                    $sort:{_id:-1}
                }
            ]).toArray()
            console.log(order);
            resolve(order)
        })
    }



}