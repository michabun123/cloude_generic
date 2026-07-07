// Idempotent local-MongoDB bootstrap for testPrepSmallHello.
// Run as admin:
//   mongosh "mongodb://admin:admin123@localhost:27017/admin?authSource=admin" db/bootstrap/01_create_mongo_user.js
// Creates a DEDICATED service user (never reuse a shared user) with readWrite on
// the runtime DB (smallTest) and the isolated test DB (smallTestTest).

const user = "smallT";
const pwd = "smallT";
const roles = [
    { role: "readWrite", db: "smallTest" },
    { role: "readWrite", db: "smallTestTest" }
];

const admin = db.getSiblingDB("admin");
if (admin.getUser(user)) {
    admin.updateUser(user, { pwd: pwd, roles: roles });
    print("Updated Mongo user '" + user + "'");
} else {
    admin.createUser({ user: user, pwd: pwd, roles: roles });
    print("Created Mongo user '" + user + "'");
}
