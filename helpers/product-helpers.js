const collection = require('../config/collection');
var db=require('../config/connection')
const bcrypt=require('bcrypt')
var objectId=require('mongodb').ObjectId
module.exports={
    addProduct:(productData)=>{
        return new Promise(async(resolve,reject)=>{

            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productData).then((data)=>{
                console.log('it is',productData)
                resolve(data.insertedId)
            })
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({_id:-1}).toArray()
            resolve(products)
        })
    },
    // getAllProductsPage:()=>{
    //     return new Promise(async(resolve,reject)=>{
    //         let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().skip(pageNo).limit(10).toArray()
    //         resolve(products)
    //     })
    // },
     getAllProductsPage: (pageNo) => {

         

        return new Promise(async (res, rej) => {
    
          let users = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([        
              {
                $skip: pageNo,
              },
              {
                $limit:10,
              },
              {
                $sort:{_id:-1}
              }
            ])
            .toArray();
            
  
    //     console.log(Count,"heheheheh")
    //   })
          res(users);
        });
      },
    
    deleteProduct:(productId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(productId)}).then((response)=>{
                // console.log(response);
                resolve(response)
            })
        })
    },
    getProductDetails:(productId)=>{
        console.log('3000000000000000000000000000000000000000000000000000000');
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(productId)}).then((response)=>{
                // console.log(response);
                console.log('34');
                resolve(response)
            })
        })
    },
    updateProduct:(productId,productDetails)=>{
        return new Promise((resolve,reject)=>{
            console.log(productDetails,"hhhhhhhhhhhhhhhh");
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(productId)},{
                $set:{Name:productDetails.Name,
                description:productDetails.description,
                price:productDetails.price,
                category:productDetails.category,
                stock:productDetails.stock
                }
            }).then((response)=>{
                console.log(response)
                resolve(`successfully edited`)
            })
        })
    },
    changeStatus: function (id) {
        return new Promise(async function (resolve, reject) {
            let product = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(id) })
            if (product.blocked == true) {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
                    $set: {
                        blocked: false
                    }
                }).then(() => {
                    resolve("unblocked")
                })
            } else {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
                    $set: {
                        blocked: true
                    }
                }).then((response) => {
                    resolve("blocked")
                })
            }
        })
    },

    

}
