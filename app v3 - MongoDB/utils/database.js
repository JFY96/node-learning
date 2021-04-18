const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

const config = require("../config.json");
const uri = config.db_uri;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect(uri)
        .then(client => {
            console.log("MongoDB Client Connected");
            _db = client.db();
            callback(client);
        })
        .catch(err => {
            console.log(err);
            throw err;
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
