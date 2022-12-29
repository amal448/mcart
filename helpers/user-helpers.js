var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { MongoCompatibilityError } = require('mongodb');
const { defaultWorkerPolicies } = require('twilio/lib/jwt/taskrouter/util');
const { response } = require('../app');
var objectId = require('mongodb').ObjectId
let referralCodeGenerator = require("referral-code-generator");
module.exports = {
    


    filterFunction: (data) => {
        filterType = data
        return new Promise(async (resolve, reject) => {
            let fictionFiltered = await db.get().collection('product').find({ category: filterType }).toArray()
            resolve(fictionFiltered)
        })
    },

    addUser: (user) => {
        var statuss = null
        return new Promise(async (resolve, reject) => {
            let emailId = await db.get().collection(collection.USER_COLLECTION).findOne({ email: user.email })
            if (!emailId) {
                user.password = await bcrypt.hash(user.password, 10)
                db.get().collection(collection.USER_COLLECTION).insertOne(user).then((data) => {
                    resolve({ statuss: true })
                })
            } else {
                console.log("This email exists")
                resolve({ statuss: false })
            }
        })
    },
    // addUser:(user, callback) => {
    //     console.log(user);
    //     user.password = bcrypt.hash(user.password,10)
    //     db.get().collection(collection.USER_COLLECTION).insertOne(user).then((data) => {
    //         console.log(data);
    //         callback(data)
    //     })
    // },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(user)
        })
    },
    deleteUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).deleteOne({ _id: objectId(userId) }).then((response) => {
                resolve(response)
            })
        })
    },
    //////////////////////////////////////////////////////////////
    getUserDetails: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((user) => {
                resolve(user)
                console.log(user, "userivide unde..............")
            })
        })
    },
    updateUser: (userId, userDetails) => {
        var statuss = null
        return new Promise(async (resolve, reject) => {
            let emailId = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: { $ne: objectId(userId) }, email: userDetails.email })
            if (!emailId) {
                userDetails.password = await bcrypt.hash(userDetails.password, 10)
                db.get().collection(collection.USER_COLLECTION)
                    .updateOne({ _id: objectId(userId) }, {
                        $set: {
                            name: userDetails.name,
                            email: userDetails.email,
                            // password: userDetails.password,
                            phone: userDetails.phone
                        }
                    }).then((response) => {
                        console.log(response)
                        resolve({ statuss: true })
                    })
            } else {
                console.log("This email exists")
                resolve({ statuss: false })
            }
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
    doSignup: (userData) => {
        var statuss = null
        console.log(userData.password);
        return new Promise(async (resolve, reject) => {
            console.log(userData.password);
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })

            if (user != null) {
                resolve({ statuss: false });
            }
            let referrel = userData.referrel;
            console.log("......///////////////////referrel.......")
            console.log(referrel)

            if (referrel) {

                let referUser = await db
                    .get()
                    .collection(collection.USER_COLLECTION)
                    .findOne({ referrelCode: referrel });
                console.log("llllllllllllllllllllllllllllllllll")
                console.log(referUser)
                

                if (referUser) {
                    console.log("I am Amal..............")
                    userData.blocked = false
                    userData.password = await bcrypt.hash(userData.password, 10)
                    console.log(userData.password)
                    let referrelCode =
                        userData.name.slice(0, 3) +
                        referralCodeGenerator.alpha("lowercase", 6);
                    console.log("rrrrrrrrrrrrrrrrrrrrrrrr")
                    userData.referrelCode = referrelCode;

                    console.log("referrelCode")
                    db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((userData) => {
                        if (referUser.wallet) {
                            walletAmount = parseInt(referUser.wallet);
                            db.get()
                                .collection(collection.USER_COLLECTION)
                                .updateOne(
                                    { _id: objectId(referUser._id) },
                                    {
                                        $set: {
                                            wallet: parseInt(100) + walletAmount,
                                        },
                                    }
                                )
                                .then(() => {

                                    resolve({ statuss: true });
                                });

                        } else {
                            db.get()
                                .collection(collection.USER_COLLECTION)
                                .updateOne(
                                    { _id: objectId(referUser._id) },
                                    {
                                        $set: {
                                            wallet: parseInt(100),
                                        },
                                    }
                                )
                                .then(() => {


                                    resolve({ statuss: true });
                                });
                        }
                    })
                } else {


                    resolve(0);
                }
            } else {

                console.log("koiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
                userData.password = await bcrypt.hash(userData.password, 10);
                let referrelCode =
                    userData.name.slice(0, 3) +
                    referralCodeGenerator.alpha("lowercase", 6);
                userData.referrelCode = referrelCode;
                db.get()
                    .collection(collection.USER_COLLECTION)
                    .insertOne(userData)
                    .then((response) => {
                        resolve({ statuss: true });
                        console.log("??????????????????????????????????????")
                        console.log(userData)
                    });
            }
        });
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}

            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                if (user.blocked) {
                    response.isblocked = true
                    resolve(response)
                }
                else {
                    bcrypt.compare(userData.password, user.password).then((status) => {
                        console.log(status, 'st')
                        if (status) {
                            console.log("login success");
                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {
                            console.log("login failed")
                            resolve({ status: false })
                        }
                    })
                }
            } else {
                console.log("no user")
                resolve({ status: false })
            }
        })
    },


    verifyPhone: (phone) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ phone: phone })
            console.log(user);
            if (user) {
                if (user.blocked) {
                    reject({ blocked: true })
                } else {

                    console.log("resolved ----------------------");
                    resolve()

                }
            } else {
                reject({ nouser: true })
            }
        })
    },

    checkMobile: (data) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection('user').findOne({ phone: data }).then((response) => {
                resolve(response)
            })
        })
    },
    otpLogin: (userData) => {
        console.log(typeof (userData.phonenumber) + ' phone number that user typed');
        return new Promise(async (resolve, reject) => {
            let userNumber = false
            let number = await db.get().collection(collection.USER_COLLECTION).findOne({ phone: userData.number })
            if (number) {
                resolve({ userNumber: true })
            } else {
                resolve({ userNumber: false })
            }
        })
    },
    verifyOTP: (number) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ phone: number })
            if (user) {
                resolve(user)
            }
        })
    },
    orderCancel: (ordId) => {
        return new Promise((resolve, reject) => {
            let status = 'cancelled'
            db.get().collection(collection.ORDER_COLLECTION).findOneAndUpdate({ _id: objectId(ordId) }, {
                $set: {
                    status: status
                }
            }).then((order) => {
                console.log("..............order in order cancel....")
                console.log(order)
                if (order.value.paymentMethod != 'COD') {
                    console.log("I am here........")
                    db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(order.value.userId) }, {
                        
                        $inc: { 'wallet': order.value.totalAmount }
                    })
                    .then((response)=>{
                        db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(order.value.userId)},{
                            $push: {
                                walletHistory: {
                                    date: new Date(),
                                    orderId:objectId(response.insertedId),
                                    //    amount: total,
                                    amount:order.value.totalAmount,
                                    status: "Cancelled from wallet Order"
                                },
                               
                            }, 
                        })
                        console.log("order cancelled for walet startdedddddddddddddddddddddddddd in then")
                        console.log(response)
                     })

                }
                resolve()
            })
        })
    },
    orderReturn: (ordId) => {
        return new Promise((resolve, reject) => {
            let status = 'returned'
            db.get().collection(collection.ORDER_COLLECTION).findOneAndUpdate({ _id: objectId(ordId) }, {
                $set: {
                    status: status
                }
            }).then((order) => {
                console.log(order, "eeeeeeeeee")
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(order.value.userId) }, {
                    $inc: { 'wallet': order.value.total }
                })
                resolve()
            })
        })
    },
    getAddressDetails: (addressId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(addressId) }).then((address) => {
                console.log(address)
                resolve(address)
            })
        })
    },

    changePassword: (userId, newPassword) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne(
                { _id: objectId(userId) },
                {
                    $set: {
                        // Password:await bcrypt.hash(newPassword,10),
                        password: await bcrypt.hash(newPassword, 10),
                    }
                }
            ).then((response) => {
                resolve()
            })
        })
    },
    updateProfile: (userID, userDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION)
                .updateOne({ _id: objectId(userID) }, {
                    $set: {
                        name: userDetails.Name
                    }
                }).then((response) => {
                    resolve()
                })
        })
    },
    totUsers: () => {
        return new Promise(async (resolve, reject) => {
            var totalUsers = await db.get().collection(collection.USER_COLLECTION).count();
            resolve(totalUsers)
            console.log(totalUsers, "...............Total users are here.......................")
        })
    },
    totProducts: () => {
        return new Promise(async (resolve, reject) => {
            var totalProducts = await db.get().collection(collection.PRODUCT_COLLECTION).count();
            resolve(totalProducts)
        })
    },

    totOrders: () => {
        return new Promise(async (resolve, reject) => {
            var totalOrders = await db.get().collection(collection.ORDER_COLLECTION).count();
            resolve(totalOrders)
        })
    },
    //    toTotal:()=>{
    //     return new Promise(async(resolve,reject)=>{
    //         var total=
    //     })
    //    },
    getMaxStock: (productId) => {
        return new Promise(async (resolve, reject) => {
            // let stock= await db.get().collection(collection.PRODUCT_COLLECTION).aggregate({$match:{_id:ObjectID(productId)}},
            // { $project:{_id:0,stock:1}}

            let stock = await db.get().collection(collection.PRODUCT_COLLECTION)
                .findOne({ _id: objectId(productId) });
            // ).toArray()
            console.log("stock", stock);
            resolve(stock);
        });
    },
    findBlockUser: (id) => {
        return new Promise(async (resolve, reject) => {
            let blockUser = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .findOne({ _id: objectId(id) });
            resolve(blockUser);
        });
    },
    getAllUsersPage: (pageNo) => {
        return new Promise(async (res, rej) => {
            let users = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $skip: pageNo,
                },
                {
                    $limit: 7,
                },
            ])
                .toArray();
            console.log('326 =', users);
            res(users);
        });
    },



}
