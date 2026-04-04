import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, AlertCircle } from "lucide-react";

interface ComparisonProps {
  originalData: any;
  requestedChanges: any;
  changedFields: string[];
}

const VendorProfileUpdateComparison = ({
  originalData,
  requestedChanges,
  changedFields,
}: ComparisonProps) => {
  // Debug logs
  console.log("\n🔍 ===== COMPARISON COMPONENT =====");
  console.log("📋 Original Data:", originalData);
  console.log("📋 Original Data category:", originalData?.category);
  console.log("📋 Requested Changes:", requestedChanges);
  console.log("📋 Requested Changes category:", requestedChanges?.category);
  console.log("📋 Changed Fields:", changedFields);
  console.log("📋 Does changedFields include 'category'?", changedFields.includes('category'));
  console.log("================================\n");

  // Field labels mapping
  const fieldLabels: Record<string, string> = {
    name: "Name",
    email: "Email",
    phone: "Phone Number",
    company: "Company Name",
    address: "Address",
    description: "Description",
    typeOfService: "Type of Service",
    category: "Category",
    subCategory: "Sub Category",
    yearOfEstablishment: "Year of Establishment",
    serviceLocation: "Service Location",
    alternatePhone: "Alternate Phone",
    whatsappNumber: "WhatsApp Number",
    businessType: "Business Type",
    gstNumber: "GST Number",
    tradeLicense: "Trade License",
    numberOfStaff: "Number of Staff",
    servicesOffered: "Services Offered",
    workingDaysTimings: "Working Days & Timings",
    adhar: "Aadhar Number",
    pan: "PAN Number",
    city: "City",
    state: "State",
    pincode: "Pincode",
    zipcode: "Zipcode",
    location: "Location",
  };

  // Format value for display
  const formatValue = (value: any, field: string): string => {
    if (value === null || value === undefined || value === "") {
      return "Not provided";
    }
    
    if (typeof value === "object" && !Array.isArray(value)) {
      if (field === "bankDetail") {
        return JSON.stringify(value, null, 2);
      }
      if (field === "experience") {
        return `${value.totalYears || 0} years in ${value.fields?.join(", ") || "N/A"}`;
      }
      if (value.name) return value.name; // For category objects
      if (value._id) return value._id;
      return JSON.stringify(value);
    }
    
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    
    return String(value);
  };

  // Get display value for nested objects
  const getDisplayValue = (data: any, field: string) => {
    if (field.includes(".")) {
      const parts = field.split(".");
      let value = data;
      for (const part of parts) {
        value = value?.[part];
      }
      return formatValue(value, field);
    }
    return formatValue(data[field], field);
  };

  // Check if value actually changed
  const hasChanged = (field: string): boolean => {
    const originalVal = originalData[field];
    const requestedVal = requestedChanges[field];
    
    console.log(`\n🔍 hasChanged check for: ${field}`);
    console.log(`  Original:`, originalVal);
    console.log(`  Requested:`, requestedVal);
    
    // Skip if both are undefined/null
    if (!originalVal && !requestedVal) {
      console.log(`  ⏭️  Both empty, skipping`);
      return false;
    }
    
    // Handle category field specially - compare IDs
    if (field === "category" || field === "categoryId") {
      const originalId = typeof originalVal === "object" ? originalVal?._id : originalVal;
      const requestedId = typeof requestedVal === "object" ? requestedVal?._id : requestedVal;
      
      console.log(`  📌 Category comparison:`);
      console.log(`    Original ID: ${originalId}`);
      console.log(`    Requested ID: ${requestedId}`);
      console.log(`    Changed: ${originalId !== requestedId}`);
      
      return originalId !== requestedId;
    }
    
    // Handle objects - compare stringified versions
    if (typeof originalVal === "object" && typeof requestedVal === "object") {
      const changed = JSON.stringify(originalVal) !== JSON.stringify(requestedVal);
      console.log(`  📦 Object comparison: ${changed ? "CHANGED" : "SAME"}`);
      return changed;
    }
    
    // Handle one is object, other is string (like category)
    if (typeof originalVal === "object" && typeof requestedVal === "string") {
      const changed = originalVal?._id !== requestedVal && originalVal?.name !== requestedVal;
      console.log(`  🔄 Object vs String: ${changed ? "CHANGED" : "SAME"}`);
      return changed;
    }
    if (typeof originalVal === "string" && typeof requestedVal === "object") {
      const changed = originalVal !== requestedVal?._id && originalVal !== requestedVal?.name;
      console.log(`  🔄 String vs Object: ${changed ? "CHANGED" : "SAME"}`);
      return changed;
    }
    
    // Simple comparison
    const original = getDisplayValue(originalData, field);
    const requested = getDisplayValue(requestedChanges, field);
    const changed = original !== requested;
    
    console.log(`  🔤 Simple comparison:`);
    console.log(`    Original display: ${original}`);
    console.log(`    Requested display: ${requested}`);
    console.log(`    Changed: ${changed ? "CHANGED" : "SAME"}`);
    
    return changed;
  };

  // Render comparison row
  const renderComparisonRow = (field: string) => {
    if (!hasChanged(field)) return null;

    const label = fieldLabels[field] || field.replace(/([A-Z])/g, " $1").trim();
    const originalValue = getDisplayValue(originalData, field);
    const requestedValue = getDisplayValue(requestedChanges, field);

    return (
      <div key={field} className="border-b border-gray-200 py-4 last:border-b-0">
        <div className="mb-2">
          <Badge variant="outline" className="text-xs font-semibold">
            {label}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original Value */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-red-700 mb-1">Current Value</p>
            <p className="text-sm text-gray-800 break-words">
              {originalValue === "Not provided" ? (
                <span className="text-gray-400 italic">{originalValue}</span>
              ) : (
                originalValue
              )}
            </p>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <ArrowRight className="w-5 h-5 text-blue-600" />
          </div>

          {/* Requested Value */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-green-700 mb-1">Requested Value</p>
            <p className="text-sm text-gray-800 break-words font-medium">
              {requestedValue === "Not provided" ? (
                <span className="text-gray-400 italic">{requestedValue}</span>
              ) : (
                requestedValue
              )}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Handle nested objects
  const renderNestedComparison = (field: string, label: string) => {
    const original = originalData[field];
    const requested = requestedChanges[field];

    if (!requested) return null;

    const originalStr = JSON.stringify(original || {}, null, 2);
    const requestedStr = JSON.stringify(requested, null, 2);

    if (originalStr === requestedStr) return null;

    return (
      <div key={field} className="border-b border-gray-200 py-4 last:border-b-0">
        <div className="mb-2">
          <Badge variant="outline" className="text-xs font-semibold">
            {label}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-red-700 mb-1">Current Value</p>
            <pre className="text-xs text-gray-800 whitespace-pre-wrap">
              {originalStr}
            </pre>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-green-700 mb-1">Requested Value</p>
            <pre className="text-xs text-gray-800 whitespace-pre-wrap font-medium">
              {requestedStr}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          Profile Update Comparison
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Review the changes requested by the vendor
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {changedFields.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No changes detected</p>
          </div>
        ) : (
          <div className="space-y-0">
            {/* Render simple field changes */}
            {changedFields
              .filter((field) => field !== "bankDetail" && field !== "experience")
              .map((field) => renderComparisonRow(field))}

            {/* Render nested object changes */}
            {changedFields.includes("bankDetail") &&
              renderNestedComparison("bankDetail", "Bank Details")}
            {changedFields.includes("experience") &&
              renderNestedComparison("experience", "Experience")}
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Changes:</span>
            <Badge variant="secondary" className="text-base">
              {changedFields.length} field{changedFields.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorProfileUpdateComparison;
