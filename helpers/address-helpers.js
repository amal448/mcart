var db=require('../config/connection')
var collection =require('../config/collection');
const {ObjectId,ObjectID}=require('mongodb');
require('dotenv').config()

module.exports={
    addAddress: function(userID,addressDetails){
        console.log("....address....")
        console.log(addressDetails);
        return new Promise(function(resolve,reject){
            addressDetails.userId=userID
          //  console.log(   addressDetails.userId,".....This is userid in addAddress....." )
            db.get().collection(collection.USER_COLLECTION).updateOne({_id: ObjectId(userID)},{
            $push:{'address':addressDetails}
        }).then((response)=>{
            resolve(response)
        })
    })

},
getAllAddress: (userId)=>{
    return new Promise(async function( resolve,reject){
        let address=await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)})
    resolve(address)
    })
},
getAddressbyId:function(id){
    return new Promise(async function(resolve,reject){
        let address=await db.get().collection(collection.ADDRESS_COLLECTION).find({userId:id}).toArray()
    resolve(address)
    })
},
getAllAdressbyUserId: function(userId){
    return new Promise(async function(resolve,reject){
        let addresses=await db.get().collection(collection.ADDRESS_COLLECTION).find({userId:userId}).toArray();
        resolve(addresses)
    })
},

editAddress:function(id,addressData){
    console.log(addressData);
        return new Promise(function(resolve, reject) {
            
            
                db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(id)}, {
                $set:{
                  
                    homeaddress:addressData.houseName,
                    fullAddress:addressData.address,
                    town:addressData.town,
                    Country:addressData.country,
                    pincode:addressData.pincode,
                    phone:addressData.phone,
                    
                }
        }).then((response)=>{
            resolve(response)
        })
    })
},
deleteAddress: function(userId,id) {
    console.log(userId,"fordeleting address....................")
    return new Promise(function(resolve, reject) {
        db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{
            $pull:{address:{id:id}}
        }).then((response) => {
            resolve(response)
        })
    })
},
orderStatusChange: (status, orderId) => {
    return new Promise((resolve, reject) => {
        // console.log(status);
        if (status == "cancelled") {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, {
                $set: {
                    status: status,
                    isCancelled: true,
                    cancellDate:new Date()
                }
            }).then(() => {
                resolve()
            })
        }else if(status=="delivered"){
            console.log("at delivered");
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{
                $set:{
                    status:status,
                    isDelivered:true,
                    deliveredDate: new Date()

                }
            }).then((res)=>{
                console.log(res);
                resolve()
            })

        }else if(status=="shipped"){
            console.log("at shipped");
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{
                $set:{
                    status:status,
                    isShipped:true,
                    shippedDate: new Date()

                }
            }).then((res)=>{
                console.log(res);
                resolve()
            })

        }else if(status=="out for delivery"){
            console.log("at out for delivery");
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{
                $set:{
                    status:status,
                    isOutForDelivery:true,
                    outForDeliveryDate: new Date()

                }
            }).then((res)=>{
                console.log(res);
                resolve()
            })

        }
         else {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, {
                $set: {
                    status: status,
                    // isCancelled: false
                }
            }).then((response) => {
                console.log(response);
                resolve()
            })

        }
    })
},
getAllOrderss: () => {
    return new Promise(async (resolve, reject) => {
        let orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
        resolve(orders)
    })
},


}