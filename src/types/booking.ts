export interface Booking {
  _id: string;
  service: {
    _id?: string;
    title: string;
    location: string;
    price: number;
    images: { url: string }[];
  };
  user: {
    _id?: string;
    name: string;
    email: string;
  };
  date: string;
  time: string;
  notes: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  payment: {
    paymentStatus: "success" | "pending" | "failed";
    paymentType: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkingHours {
  available: boolean;
  start: string;
  end: string;
}
