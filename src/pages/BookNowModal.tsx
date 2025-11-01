import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createBookingAPI } from "@/service/operations/booking";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RootState } from "@/redux/store";

const BookNowModal = ({ property }) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const { user, token } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const handleBooking = async () => {
    if (!date) {
      toast.error("Please select a booking date!");
      return;
    }
    if (!time) {
      toast.error("Please select a booking time!");
      return;
    }

    const formDataToSend = {
      service: property._id,
      user: user._id,
      date,
      time,
      notes,
      payment: {
        paymentType: "cash",
        paymentStatus: "pending",
      },
    };

    const res = await createBookingAPI(formDataToSend);
    if (res) {
      setOpen(false);
    }
  };

  const handleOpen = () => {
    if (!token) {
      toast.info("You need to login to book a service!");
      navigate("/login");
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <Button
        className="bg-red-500 hover:bg-red-600 w-full text-white font-semibold"
        onClick={handleOpen}
      >
        Book Now
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl h-[650px] overflow-y-auto">
          {/* Header */}
          <DialogHeader className="px-6 pt-4">
            <DialogTitle className="text-xl font-semibold">
              Book Services
            </DialogTitle>
          </DialogHeader>

          {/* Property Image + Info Row */}
          <div className="flex items-center space-x-4 px-6 py-4 bg-gray-50 rounded-lg">
            {property.images?.[0]?.url && (
              <img
                src={property.images[0].url}
                alt={property.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {property.title}
              </h3>
              <p className="text-gray-600 text-sm">{property.location}</p>
              <p className="text-gray-800 font-semibold mt-1">
                ₹{property.price}
              </p>
            </div>
          </div>

          {/* Booking Form */}
          <div className="px-6 py-4 space-y-4">
            {/* Date */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Booking Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Booking Time
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Notes (optional)
              </label>
              <Textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special instructions..."
                className="w-full"
              />
            </div>

            {/* Confirm Button */}
            <Button
              onClick={handleBooking}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookNowModal;
