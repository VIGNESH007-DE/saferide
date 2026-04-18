export type UserRole = 'driver' | 'passenger';

export interface UserProfile {
  uid: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  role: UserRole;
  vehicleNumber?: string;
  licenseUrl?: string;
  createdAt: any;
}

export interface Trip {
  id: string;
  driverId: string;
  driverName: string;
  source: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  date: string;
  time: string;
  seats: number;
  availableSeats: number;
  price: number;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Booking {
  id: string;
  tripId: string;
  passengerId: string;
  passengerName: string;
  driverId: string;
  seats: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  type: 'ride' | 'parcel';
  parcelDetails?: {
    weight: string;
    size: string;
    description: string;
  };
  paymentStatus?: 'pending' | 'paid';
}
