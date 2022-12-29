var db=require('../config/connection')
var collection=require('../config/collection')
const{CATEGORY_COLLECTION }=require('../config/collection');
const { response }=require('../app');
var objectId=require('mongodb').ObjectId

module.exports={
    get_category_list:(req)=>{
        return new Promise(async (resolve,reject)=>{
            var category_list=await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category_list)
        })
    },
   

     add_category:(data)=>{
         return new Promise(async(resolve,reject)=>{
         await db.get().collection(collection.CATEGORY_COLLECTION).findOne({category:data.category}).then((response)=>{


            if(response){
                resolve({status:false})
            }
            else{
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(data).then((response)=>{
                   
                    resolve({status:true})
   
                })
            }
        })
    })
         
     },
    
    delete_category:(id)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(id)}).then((response)=>{
                 resolve("Category successfully Deleted")
                
            })


        })

    },
    updateCategory:(categoryId,categoryList)=>{
        console.log(categoryList,"kfkkknf");
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: objectId(categoryId)},{$set:{category:categoryList.category}
        }).then((response)=>{
            resolve(`Successfully edited`)
        })
        })
    },
    getCategoryDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })

    },
    getAllCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            let category=await db.get().collection(collection.CATEGORY_COLLECTION).find().sort({_id:-1}).toArray()
            resolve(category)
        })
    },
    getAllCategoryProduct:(categoryID)=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({category:categoryID}).toArray()
            resolve(products)
        })
    },
    getCategory:(catID)=>{
        return new Promise(async (resolve,reject)=>{
            let category=await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catID)})
            resolve(category)
        })
    },
    get_category_listPage: (pageNo) => {
        return new Promise(async (res, rej) => {
          let users = await db.get().collection(collection.CATEGORY_COLLECTION).aggregate([        
              {
                $skip: pageNo,
              },
              {
                $limit:4,
              },
              {
                $sort:{_id:-1}
              }
            ])
            .toArray();
          res(users);
        });
      },

}