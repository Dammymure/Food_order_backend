"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetVandorByID = exports.GetVandors = exports.CreateVandor = exports.FindVandor = void 0;
const models_1 = require("../models");
const utility_1 = require("../utility");
const FindVandor = (id, email) => __awaiter(void 0, void 0, void 0, function* () {
    if (email) {
        return yield models_1.Vandor.findOne({ email: email });
    }
    else {
        return yield models_1.Vandor.findById(id);
    }
});
exports.FindVandor = FindVandor;
const CreateVandor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, address, pincode, foodType, email, password, ownerName, phone, } = req.body;
    const existingVandor = yield (0, exports.FindVandor)("", email);
    if (existingVandor !== null) {
        return res.json({ message: "A Vandor already exists with this email" });
    }
    // Generate salt
    const salt = yield (0, utility_1.GenerateSalt)();
    const userPassword = yield (0, utility_1.GeneratePassword)(password, salt);
    // encryptthe password using salt
    const CreateVandor = yield models_1.Vandor.create({
        name: name,
        address: address,
        ownerName: ownerName,
        pincode: pincode,
        foodType: foodType,
        phone: phone,
        email: email,
        password: userPassword,
        salt: salt,
        serviceAvailable: false,
        coverImage: [],
        rating: 0,
        foods: [],
    });
    return res.json(CreateVandor);
});
exports.CreateVandor = CreateVandor;
const GetVandors = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const vandors = yield models_1.Vandor.find();
    if (vandors !== null) {
        return res.json(vandors);
    }
    return res.json({ message: "Vandor data not available" });
});
exports.GetVandors = GetVandors;
const GetVandorByID = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const vandorId = req.params.id;
    const vandor = yield (0, exports.FindVandor)(vandorId);
    if (vandor !== null) {
        return res.json(vandor);
    }
    return res.json({ message: "Vandor data not available" });
});
exports.GetVandorByID = GetVandorByID;
