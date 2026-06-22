"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryName = exports.UserStatus = exports.Role = void 0;
var Role;
(function (Role) {
    Role["STUDENT"] = "STUDENT";
    Role["CATEGORY_ADMIN"] = "CATEGORY_ADMIN";
    Role["MAIN_ADMIN"] = "MAIN_ADMIN";
})(Role || (exports.Role = Role = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["PENDING"] = "PENDING";
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["REJECTED"] = "REJECTED";
    UserStatus["SUSPENDED"] = "SUSPENDED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var CategoryName;
(function (CategoryName) {
    CategoryName["CYBERSECURITY"] = "CYBERSECURITY";
    CategoryName["DEVELOPMENT"] = "DEVELOPMENT";
    CategoryName["NETWORKING"] = "NETWORKING";
    CategoryName["CREATIVE_WORKS"] = "CREATIVE_WORKS";
})(CategoryName || (exports.CategoryName = CategoryName = {}));
//# sourceMappingURL=enums.js.map