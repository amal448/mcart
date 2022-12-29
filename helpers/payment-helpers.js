var db = require('../config/connection')
var collection = require('../config/collection');
const { CATEGORY_COLLECTION } = require('../config/collection');
const { response } = require('../app');
// const { ObjectID, ObjectId } = require('bson');
var objectId = require('mongodb').ObjectId
 const paypal = require('paypal-rest-sdk');
const Razorpay = require('razorpay');


paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ATUxljba4faA6BGE5t8DRHBEpzK5MBzLuFqUlih7hGx9YfGld7zlcrrU6IXhQls-jeT3Mfg_Ltel2dFD',
    'client_secret': 'EEkUmuC2pXeQxJlqy9jioE_reS5ECoVhru0HXFUN-UWLhlMQPbkFSPsZcOEeJiRsxM_SWE8FPhUH54LV',
});

var instance = new Razorpay({
    key_id:'rzp_test_5kxtiHqzDh1ydC',
    key_secret:'oMfQa8ucC3D6akL8FnGn3cka',
});
module.exports = {
generateRazorpay:(orderId, total) => {
    console.log(orderId, "ordreee");
    return new Promise((resolve, reject) => {
        var options = {
            
            amount: total * 100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: "" + orderId
        };
        instance.orders.create(options, function (err, order) {
            if(err){
                console.log(err,'is the err occured in the generate rzp')
            }
            console.log("new", order);
            resolve(order)
        });
    })
},
verifyPayment: (details) => {
    console.log(details, 'deeeeeee');
    return new Promise((resolve, reject) => {
        try {
            const crypto = require("crypto");
            
            let hmac = crypto.createHmac("sha256", "oMfQa8ucC3D6akL8FnGn3cka ");
            hmac.update(details.payment.razorpay_order_id +"|" +details.payment.razorpay_payment_id);
              hmac = hmac.digest("hex");
              console.log(details,'detailssssssssss');
              console.log(hmac,'hmccccccc');
              if (hmac==details.payment.razorpay_signature) {

                resolve();
              } else {
                console.log('failed');
                reject();
              }

        } catch (error) {
            reject()
            console.log(error,'is the error in order placing');
        }
    })
},

changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
            {
                $set: { status: 'placed', }
            }
        ).then(() => {
            resolve()
        })
    })
},
genaretePaypal: (orderId, total) => {
            return new Promise((resolve, reject) => {
                var create_payment_json = {
                    "intent": "sale",
                    "payer": {
                        "payment_method": "paypal"
                    },
                    "redirect_urls": {
                        "return_url": "http://localhost:5000/payment-success",
                        "cancel_url": "http://localhost:5000/place-order"
                    },
                    "transactions": [{
                        "item_list": {
                            "items": [{
                                "name": "item",
                                "sku": "item",
                                "price": total,
                                "currency": "USD",
                                "quantity": 1
                            }]
                        },
                        "amount": {
                            "currency": "USD",
                            "total": total
                        },
                        "description": "This is the payment description."
                    }]
                };
                paypal.payment.create(create_payment_json, function (error, payment) {
                    if (error) {
                        throw error;
                    } else {
                        console.log("Create Payment Response");
                        console.log(payment, 'payment type');
                        console.log(payment.links[1].href);
                        resolve(payment.links[1].href)
                    }
                });
            })
    
        },
    
}

