export interface CreateVendorInput {
  name: string;
  ownerName: string;
  foodType: [string];
  pincode: string;
  address: string;
  phone: string;
  email: string;
  password: string;
}

export interface EditVendorInputs {
  name: string;
  address: string;
  phone: string;
  foodTypes: [string];
}

export interface VendorLoginInputs {
  email: string;
  password: string;
}

export interface VendorPayload {
  _id: string;
  email: string;
  name: string;
  foodTypes: [string];
  // More could be added
}

export interface CreateOfferInputs {
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