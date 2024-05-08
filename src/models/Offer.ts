import mongoose, { Schema, Document } from "mongoose";

export interface OfferDoc extends Document {
  offerType: string; //VENDOR //GENERIC
  vendors: [any]; //['898jd890909']
  title: string; //INR 200 off on week days
  description: string; //any description with terms and condition
  minValue: number; //minimum order anount
  offerAmount: number; //offer amount 200
  startValidity: Date;
  endValidity: Date;
  promocode: string; //WEEK2024
  promoType: string; //USER // ALL // BANK //CARD
  bank: [any];
  bins: [any];
  pincode: string; //
  isActive: boolean;
}

const OfferSchema = new Schema(
  {
   
  offerType: {type: String, required: true},
  vendors: [
   {
    type: Schema.Types.ObjectId, ref:'vendor'
   }
  ],
  title: {type: String, required: true}, 
  description: {type: String}, 
  minValue: {type: String, required: true},
  offerAmount: {type: Number, required: true},
  startValidity: Date,
  endValidity: Date,
  promocode: {type: String, required: true},
  promoType: {type: String, required: true},
  bank: [
   {type: String}
  ],
  bins: [
   {type: Number}
  ],
  pincode: {type: String, required: true},
  isActive: Boolean
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v
      },
    },
    timestamps: true,
  }
);

const Offer = mongoose.model<OfferDoc>("offer", OfferSchema);

export { Offer };
