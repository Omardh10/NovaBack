const mongoose = require('mongoose');


const ConnectToDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("connect to db");

    } catch (error) {
        console.log("some thing error ", error);

    }
}
module.exports={ConnectToDb}