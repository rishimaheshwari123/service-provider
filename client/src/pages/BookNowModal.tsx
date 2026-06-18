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
import { MapPin } from "lucide-react";
import { RootState } from "@/redux/store";

const BookNowModal = ({ property }) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  
  // Address fields
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [fetchingLocation, setFetchingLocation] = useState(false);
  
  // Coordinates
  const [coordinates, setCoordinates] = useState<{latitude: number | null, longitude: number | null}>({
    latitude: null,
    longitude: null
  });
  
  const { user, token } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  // Function to get current location
  const getCurrentLocation = () => {
    setFetchingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser!");
      setFetchingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Store coordinates immediately
        setCoordinates({ latitude, longitude });
        
        try {
          // Use Nominatim (OpenStreetMap) for reverse geocoding - it's free
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en&zoom=18`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.address) {
              const addr = data.address;
              
              // Build proper address line with better priority
              let addressLine1 = "";
              
              // Priority 1: Specific building/house info
              if (addr.house_number && addr.road) {
                addressLine1 = `${addr.house_number}, ${addr.road}`;
              }
              // Priority 2: Road/Street name
              else if (addr.road) {
                addressLine1 = addr.road;
              }
              // Priority 3: Commercial/POI
              else if (addr.shop || addr.amenity || addr.building) {
                addressLine1 = addr.shop || addr.amenity || addr.building;
              }
              // Priority 4: Neighbourhood/Locality
              else if (addr.neighbourhood) {
                addressLine1 = addr.neighbourhood;
              }
              // Priority 5: Suburb/Area
              else if (addr.suburb) {
                addressLine1 = addr.suburb;
              }
              // Priority 6: Village/Town
              else if (addr.village || addr.town) {
                addressLine1 = addr.village || addr.town;
              }
              // Fallback
              else {
                addressLine1 = "Current Location";
              }
              
              setAddressLine1(addressLine1);
              setCity(addr.city || addr.town || addr.village || addr.suburb || "");
              setState(addr.state || addr.region || "");
              setZipCode(addr.postcode || "");
              setCountry(addr.country || "India");
              
              toast.success("Address fetched successfully!");
            } else {
              throw new Error("No address data found");
            }
          } else {
            throw new Error("Geocoding failed");
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          
          // Try alternative free service - BigDataCloud
          try {
            const response2 = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            
            if (response2.ok) {
              const data2 = await response2.json();
              
              // Use more accurate address parsing
              let addressLine1 = "";
              let city = "";
              let state = "";
              let zipCode = "";
              
              // Try to get the most specific address
              if (data2.localityInfo && data2.localityInfo.administrative) {
                const admin = data2.localityInfo.administrative;
                // Get the most specific locality (usually the smallest administrative unit)
                for (let i = admin.length - 1; i >= 0; i--) {
                  if (admin[i].name && admin[i].adminLevel >= 8) {
                    addressLine1 = admin[i].name;
                    break;
                  }
                }
                
                // Get city (usually adminLevel 6 or 7)
                for (let i = 0; i < admin.length; i++) {
                  if (admin[i].adminLevel >= 6 && admin[i].adminLevel <= 7) {
                    city = admin[i].name;
                    break;
                  }
                }
                
                // Get state (usually adminLevel 4)
                for (let i = 0; i < admin.length; i++) {
                  if (admin[i].adminLevel === 4) {
                    state = admin[i].name;
                    break;
                  }
                }
              }
              
              // Fallback to main properties if admin parsing failed
              if (!addressLine1) {
                addressLine1 = data2.locality || data2.city || "Current Location";
              }
              if (!city) {
                city = data2.city || data2.locality || "";
              }
              if (!state) {
                state = data2.principalSubdivision || "";
              }
              
              setAddressLine1(addressLine1);
              setCity(city);
              setState(state);
              setZipCode(data2.postcode || "");
              setCountry(data2.countryName || "India");
              
              toast.success("Address fetched successfully!");
            } else {
              throw new Error("Alternative geocoding failed");
            }
          } catch (error2) {
            console.error("Alternative geocoding error:", error2);
            
            // Final fallback: set coordinates and ask user to fill manually
            setAddressLine1(`Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            setCountry("India");
            toast.info("Location detected! Please fill address details manually.");
          }
        }
        
        setFetchingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Unable to retrieve your location!";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permission.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        toast.error(errorMessage);
        setFetchingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000, // Increased timeout for better accuracy
        maximumAge: 60000 // 1 minute cache
      }
    );
  };

  const handleBooking = async () => {
    if (!date) {
      toast.error("Please select a booking date!");
      return;
    }
    if (!time) {
      toast.error("Please select a booking time!");
      return;
    }
    if (!addressLine1) {
      toast.error("Please enter your address!");
      return;
    }

    const formDataToSend = {
      service: property._id,
      user: user._id,
      date,
      time,
      notes,
      address: {
        addressLine1,
        city,
        state,
        zipCode,
        country,
        coordinates: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        }
      },
      payment: {
        paymentType: "cash",
        paymentStatus: "pending",
      },
    };

    const res = await createBookingAPI(formDataToSend);
    if (res) {
      setOpen(false);
      // Reset form
      setDate("");
      setTime("");
      setNotes("");
      setAddressLine1("");
      setCity("");
      setState("");
      setZipCode("");
      setCountry("");
      setCoordinates({ latitude: null, longitude: null });
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
        <DialogContent className="max-w-md rounded-2xl h-[700px] overflow-y-auto">
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

            {/* Address Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-gray-700 text-sm font-medium">
                  Service Address
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={fetchingLocation}
                  className="flex items-center gap-2 text-xs"
                >
                  <MapPin className="w-3 h-3" />
                  {fetchingLocation ? "Getting..." : "Current Location"}
                </Button>
              </div>

              {/* Address Line 1 */}
              <div>
                <Input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Address Line 1"
                  className="w-full"
                />
              </div>

              {/* City and State */}
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full"
                />
                <Input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className="w-full"
                />
              </div>

              {/* Zip Code and Country */}
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Zip Code"
                  className="w-full"
                />
                <Input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country"
                  className="w-full"
                />
              </div>

              {/* Coordinates Display/Input */}
              {coordinates.latitude && coordinates.longitude && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-xs text-green-700 font-medium mb-1">GPS Coordinates:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600">Latitude:</label>
                      <Input
                        type="number"
                        step="any"
                        value={coordinates.latitude || ""}
                        onChange={(e) => setCoordinates(prev => ({
                          ...prev,
                          latitude: parseFloat(e.target.value) || null
                        }))}
                        className="text-xs h-8"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Longitude:</label>
                      <Input
                        type="number"
                        step="any"
                        value={coordinates.longitude || ""}
                        onChange={(e) => setCoordinates(prev => ({
                          ...prev,
                          longitude: parseFloat(e.target.value) || null
                        }))}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>
                </div>
              )}
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
