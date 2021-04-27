const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

const config = require("../config.json");
const uri = config.db_uri;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let _db;

const mongoConnect = (callback) => {
    client.connect(err => {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log("MongoDB Client Connected");
            _db = client.db();
            callback(client);
        }
    });
};

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw "No database found";
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
