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
exports.EditCustomerProfile = exports.GetCustomerProfile = exports.RequestOtp = exports.CustomerVerify = exports.CustomerLogin = exports.CustomerSignUp = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const Customer_dto_1 = require("../dto/Customer.dto");
const utility_1 = require("../utility");
const Customer_1 = require("../models/Customer");
const CustomerSignUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.CreateCustomerInputs, req.body);
    const inputErrors = yield (0, class_validator_1.validate)(customerInputs, {
        validationError: { target: true },
    });
    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }
    const { email, phone, password } = customerInputs;
    const salt = yield (0, utility_1.GenerateSalt)();
    const userPassword = yield (0, utility_1.GeneratePassword)(password, salt);
    const { otp, expiry } = (0, utility_1.GenerateOtp)();
    const existingCustomer = yield Customer_1.Customer.findOne({ email: email });
    if (existingCustomer !== null) {
        return res.status(400).json({ message: "User Already exists" });
    }
    const result = yield Customer_1.Customer.create({
        email: email,
        password: userPassword,
        salt: salt,
        phone: phone,
        firstname: "",
        lastname: "",
        address: "",
        otp: otp,
        otp_expiry: expiry,
        verified: false,
        lat: 0,
        log: 0,
    });
    if (result) {
        // send the OTP to customer
        yield (0, utility_1.onRequestOTP)(otp, phone);
        // generate the signature
        const signature = (0, utility_1.GenerateSignature)({
            _id: result._id,
            email: result.email,
            verified: result.verified,
        });
        // send the result to client
        return res.status(201).json({
            signature: signature,
            verified: result.verified,
            email: result.email,
        });
    }
    return res.status(400).json({ message: "Error with SignUp" });
});
exports.CustomerSignUp = CustomerSignUp;
// ---------------------------------------------------------------------------------------
const CustomerLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const loginInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.UserLoginInputs, req.body);
    const loginErrors = yield (0, class_validator_1.validate)(loginInputs, {
        validationError: { target: false },
    });
    if (loginErrors.length > 0) {
        return res.status(400).json(loginErrors);
    }
    const { email, password } = loginInputs;
    const customer = yield Customer_1.Customer.findOne({ email: email });
    if (customer) {
        const validation = yield (0, utility_1.ValidatePassword)(password, customer.password, customer.salt);
        if (validation) {
            // generate the signature
            const signature = (0, utility_1.GenerateSignature)({
                _id: customer._id,
                email: customer.email,
                verified: customer.verified,
            });
            // send the result to client
            return res.status(201).json({
                signature: signature,
                verified: customer.verified,
                email: customer.email,
            });
        }
    }
    return res.status(404).json({ message: "Login Error" });
});
exports.CustomerLogin = CustomerLogin;
// -------------------------------------------------------------------------------
const CustomerVerify = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    const customer = req.user;
    if (customer) {
        const profile = yield Customer_1.Customer.findById(customer._id);
        if (profile) {
            if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
                profile.verified = true;
                const updateCustomerResponse = yield profile.save();
                // Generate the signature
                const signature = (0, utility_1.GenerateSignature)({
                    _id: updateCustomerResponse._id,
                    email: updateCustomerResponse.email,
                    verified: updateCustomerResponse.verified,
                });
                return res.status(201).json({
                    signature: signature,
                    verified: updateCustomerResponse.verified,
                    email: updateCustomerResponse.email,
                });
            }
        }
    }
    return res.status(400).json({ message: "Error with OTP Validation" });
});
exports.CustomerVerify = CustomerVerify;
// =============================================================================
// export const RequestOtp = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const customer = req.user;
//   if (customer) {
//     const profile = await Customer.findById(customer._id);
//     if (profile) {
//       const { otp, expiry } = GenerateOtp();
//       profile.otp = otp;
//       profile.otp_expiry = expiry;
//       await profile.save();
//       await onRequestOTP(otp, profile.phone);
//       res.status(200).json({ message: "OTP Sent to your registered number!" });
//     }
//     res.status(400).json({ message: "Error with Request OTP" });
//   }
// };
const RequestOtp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (!customer) {
        return res.status(400).json({ message: "Error with Request OTP" });
    }
    try {
        const profile = yield Customer_1.Customer.findById(customer._id);
        if (!profile) {
            return res.status(400).json({ message: "Error with Request OTP" });
        }
        const { otp, expiry } = (0, utility_1.GenerateOtp)();
        profile.otp = otp;
        profile.otp_expiry = expiry;
        yield profile.save();
        yield (0, utility_1.onRequestOTP)(otp, profile.phone);
        res.status(200).json({ message: "OTP Sent to your registered number!" });
    }
    catch (error) {
        console.error("Error in RequestOtp:", error);
        res.status(500).json({ message: "Error in RequestOtp" });
    }
});
exports.RequestOtp = RequestOtp;
// ========================================================================
const GetCustomerProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (customer) {
        const profile = yield Customer_1.Customer.findById(customer._id);
        if (profile) {
            return res.status(200).json(profile);
        }
    }
    res.status(400).json({ message: "Error with fetch profile" });
});
exports.GetCustomerProfile = GetCustomerProfile;
// ===========================================================================
const EditCustomerProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    const profileInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.EditCustomerProfileInputs, req.body);
    const profileErrors = yield (0, class_validator_1.validate)(profileInputs, {
        validationError: { target: false },
    });
    if (profileErrors.length > 0) {
        return res.status(400).json(profileErrors);
    }
    const { firstname, lastname, address } = profileInputs;
    if (customer) {
        const profile = yield Customer_1.Customer.findById(customer._id);
        if (profile) {
            profile.firstname = firstname;
            profile.lastname = lastname;
            profile.address = address;
            const result = yield profile.save();
            res.status(200).json(result);
        }
    }
});
exports.EditCustomerProfile = EditCustomerProfile;
