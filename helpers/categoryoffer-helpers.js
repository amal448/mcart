const collection = require('../config/collection');
var db = require('../config/connection')
var objectId = require('mongodb').ObjectId
const moment = require('moment')

module.exports = {



    addCategoryOffer: (offer) => {
        console.log("  call from addCategoryOffer")
        console.log(offer)
        return new Promise(async (resolve, reject) => {
            console.log("104")
            try {
                offer.startDateIso = new Date(offer.starting)
                offer.endDateIso = new Date(offer.expiry)
                const category = await db.get().collection(collection.CATEGORYOFFER_COLLECTION).findOne({ category: offer.category })
                console.log("1")
                if (category) {
                    reject('Offer Exist')
                } else {
                    console.log("2")

                    db.get().collection(collection.CATEGORYOFFER_COLLECTION).insertOne(offer).then(() => {
                        resolve()
                    })
                }
            } catch {
                console.log("0");
                resolve(0);
            }
        })
    },



    getAllCatOffers: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let AllCatOfferss = await db.get().collection(collection.CATEGORYOFFER_COLLECTION).find().toArray()
                resolve(AllCatOfferss)
                console.log("This is offers............")
                console.log(offers)
            }
            catch {
                resolve(0)
            }

        })
    }
    ,

    getCatOfferDetails: (offerId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.CATEGORYOFFER_COLLECTION).findOne({ _id: objectId(offerId) }).then((response) => {
                    resolve(response)
                    console.log("this is response from the get Catofferdetails.............")
                    console.log("response")
                })
            } catch {
                resolve(0)
            }
        })
    }
    ,


    updateCatOffer: (catOfferId, offer) => {
        console.log("here is update in Catofferrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr")
        return new Promise(async (resolve, reject) => {
            try {
                // const expiry = moment(offer.expiry).format("YYYY-MM-DD");
                // const starting = moment(offer.starting).format("YYYY-MM-DD");

                // CategoryOffer.findByIdAndUpdate(offer.id, {

                db.get().collection(collection.CATEGORYOFFER_COLLECTION).updateOne({
                    _id: objectId(catOfferId)
                },
                    {
                        $set: {
                            category: offer.category,
                            starting: offer.starting,
                            expiry: offer.expiry,
                            catOfferPercentage: parseInt(offer.catOfferPercentage),
                            startDateIso: new Date(offer.starting),
                            endDateIso: new Date(offer.expiry)
                        }
                    }

                ).then(async () => {
                    // const products = await Product.find({ category: offer.category, categOffer: true })
                    let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: offer.category, offer: { $exists: true } }).toArray()
                    if (products) {
                        products.map(async (product) => {

                            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(product._id) }, {
                                $set: {
                                    price: product.actualPrice,
                                    categOffer: false
                                },
                                $unset: {
                                    offer: "",
                                    catofferPercentage: "",
                                    actualPrice: "",
                                }
                            }).then(() => {
                                resolve()
                            })
                        })
                    } else {
                        resolve()
                    }
                    resolve()
                })
            } catch {
                reject('Something Wrong!!! Try Again...')
            }

        })
    }
    ,


    startCategoryOffer: (date) => {
        let startDateIso = new Date(date)
      
        return new Promise(async (resolve, reject) => {
            
            try {
              
                let data = await db.get().collection(collection.CATEGORYOFFER_COLLECTION).find({ startDateIso: { $lte: startDateIso } }).toArray()
                console.log(data,"herehereeeeeeeee")
                if (data.length > 0) {
                   
                    await data.map(async(onedata) => {
                        console.log(onedata,"hahahahahaha")
                        
                        // let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: onedata.category, offer: { $exists: false } }).toArray()

                        let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({category:onedata.category, offer: { $exists: false } }).toArray()
                        console.log(products,"here products in startcategory") 
                        if (products) {
                            
                            await products.map((product) => {
                                let actualPrice = product.price
                                let newPrice = (((actualPrice * onedata.catOfferPercentage)) / 100);
                                newPrice = newPrice.toFixed();
                                
                                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(product._id) }, {
                                    $set: {
                                        actualPrice: actualPrice,
                                        price: actualPrice - newPrice,
                                        offer: true,
                                        catofferPercentage: onedata.catOfferPercentage
                                        
                                    }
                                
                                                        
                                })
                            })
                        }
                    })
                    
                    resolve();
                } else {
                    resolve()
                }
            } catch {
                resolve(0)
            }
        })

    },
    deleteCatOffer: (catOfferId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let catOffer = await db.get().collection(collection.CATEGORYOFFER_COLLECTION).findOne({ _id: objectId(catOfferId) })
                let category = catOffer.category
                let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: category, offer: { $exists: true } }).toArray()
                if (products) {
                    await db.get().collection(collection.CATEGORYOFFER_COLLECTION).deleteOne({ _id: objectId(catOfferId) }).then(async () => {
                        await products.map(async (product) => {
                            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(product._id) }, {
                                $set: {
                                    price: product.actualPrice
                                },
                                $unset: {
                                    offer: "",
                                    catofferPercentage: "",
                                    actualPrice: "",
                                }
                            }).then(() => {
                                resolve()
                            })

                        })

                    })
                } else {
                    resolve()
                }
            } catch {
                resolve(0)
            }
        })
    }







}
