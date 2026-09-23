export type Role = 'customer' | 'seller' | 'admin';
export type SellerStatus = 'pending' | 'approved' | 'active' | 'suspended' | 'banned' | 'rejected';
export type CustomerStatus = 'active' | 'suspended' | 'banned';

export interface UserDocument {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: SellerStatus | CustomerStatus;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface SellerProfile extends UserDocument {
  shopName: string;
  shopAddress: string;
  city: string;
  pincode: string;
  shopContactNumber: string;
  businessType: string;
  deliveryAvailable: boolean;
  deliveryRadius: number;
  deliveryCharge: number;
  minimumOrder: number;
  shopLogo?: string;
  shopBanner?: string;
  openStatus: boolean;
  rating?: number;
}
