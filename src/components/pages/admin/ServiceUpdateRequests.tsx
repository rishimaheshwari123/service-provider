import React, { useState, useEffect } from 'react';
import {
  getPendingServiceUpdateRequestsAPI,
  approveServiceUpdateRequestAPI,
  rejectServiceUpdateRequestAPI
} from '../../../service/operations/serviceUpdateRequest';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

interface ServiceUpdateRequest {
  _id: string;
  property: {
    _id: string;
    title: string;
  } | null;
  vendor: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  requestType: 'update' | 'image_update';
  proposedChanges: {
    title: string;
    price: string;
    location: string;
    type: string;
    category: {
      _id: string;
      name: string;
    };
    description: string;
    images: Array<{
      public_id: string;
      url: string;
    }>;
    status: string;
  };
  currentValues: {
    title: string;
    price: string;
    location: string;
    type: string;
    category: {
      _id: string;
      name: string;
    };
    description: string;
    images: Array<{
      public_id: string;
      url: string;
    }>;
    status: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  createdAt: string;
}

const ServiceUpdateRequests: React.FC = () => {
  const [requests, setRequests] = useState<ServiceUpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ServiceUpdateRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [adminMessage, setAdminMessage] = useState('');

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const token = (user as any)?.token;
      const data = await getPendingServiceUpdateRequestsAPI(token);
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (request: ServiceUpdateRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setShowModal(true);
    setAdminMessage('');
  };

  const confirmAction = async () => {
    if (!selectedRequest || !user?._id) return;

    try {
      const token = (user as any)?.token;
      if (actionType === 'approve') {
        await approveServiceUpdateRequestAPI(selectedRequest._id, user._id, adminMessage, token);
      } else {
        await rejectServiceUpdateRequestAPI(selectedRequest._id, user._id, adminMessage, token);
      }

      // Refresh the list
      await fetchPendingRequests();
      setShowModal(false);
      setSelectedRequest(null);
      setAdminMessage('');
    } catch (error) {
      console.error('Error processing request:', error);
    }
  };

  const renderChanges = (current: any, proposed: any, field: string) => {
    const currentValue = current?.[field];
    const proposedValue = proposed?.[field];

    if (field === 'category') {
      const currentName = currentValue?.name || 'N/A';
      const proposedName = proposedValue?.name || 'N/A';

      if (currentName === proposedName) {
        return <span className="text-gray-600">{currentName}</span>;
      }

      return (
        <div className="flex items-center gap-2">
          <span className="text-red-500 line-through">{currentName}</span>
          <span className="text-gray-400">→</span>
          <span className="text-green-600 font-medium">{proposedName}</span>
        </div>
      );
    }

    if (field === 'images') {
      const hasCurrentImages = currentValue && Array.isArray(currentValue) && currentValue.length > 0;
      const hasProposedImages = proposedValue && Array.isArray(proposedValue) && proposedValue.length > 0;

      return (
        <div className="space-y-4">
          <div>
            <strong className="text-sm text-gray-600">Current Images:</strong>
            <div className="flex flex-wrap gap-2 mt-2">
              {hasCurrentImages ? (
                currentValue.map((img: any, idx: number) => (
                  <div key={idx} className="relative w-24 h-24">
                    <img
                      src={img.url}
                      alt={`Current ${idx + 1}`}
                      className="w-24 h-24 object-cover rounded border-2 border-red-300"
                    />
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-1 right-1 bg-black bg-opacity-75 hover:bg-black text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow transition-colors"
                    >
                      View
                    </a>
                  </div>
                ))
              ) : (
                <span className="text-gray-400 text-sm">No images</span>
              )}
            </div>
          </div>
          <div>
            <strong className="text-sm text-gray-600">Proposed Images:</strong>
            <div className="flex flex-wrap gap-2 mt-2">
              {hasProposedImages ? (
                proposedValue.map((img: any, idx: number) => (
                  <div key={idx} className="relative w-24 h-24">
                    <img
                      src={img.url}
                      alt={`Proposed ${idx + 1}`}
                      className="w-24 h-24 object-cover rounded border-2 border-green-300"
                    />
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-1 right-1 bg-black bg-opacity-75 hover:bg-black text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow transition-colors"
                    >
                      View
                    </a>
                  </div>
                ))
              ) : (
                <span className="text-gray-400 text-sm">No images</span>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Handle null/undefined values
    const displayCurrent = currentValue || 'N/A';
    const displayProposed = proposedValue || 'N/A';

    if (displayCurrent === displayProposed) {
      return <span className="text-gray-600">{displayCurrent}</span>;
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-red-500 line-through">{displayCurrent}</span>
        <span className="text-gray-400">→</span>
        <span className="text-green-600 font-medium">{displayProposed}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user?.isManageService) {
    return (
      <div className="text-red-600 text-center p-4 font-semibold">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="md:ml-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Service Update Requests</h1>
        <p className="text-gray-600 mt-2">
          Review and approve vendor service update requests
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">No pending service update requests</div>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {request.property?.title || 'Property Deleted'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Request by: {request.vendor.name} ({request.vendor.phone})
                    </p>
                    <p className="text-sm text-gray-500">
                      Type: {request.requestType === 'image_update' ? 'Image Update' : 'Service Update'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Submitted: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(request, 'approve')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(request, 'reject')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {request.reason && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-md">
                    <strong className="text-blue-800">Reason:</strong>
                    <p className="text-blue-700 mt-1">{request.reason}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Title</h4>
                    {renderChanges(request.currentValues, request.proposedChanges, 'title')}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Price</h4>
                    {renderChanges(request.currentValues, request.proposedChanges, 'price')}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Location</h4>
                    {renderChanges(request.currentValues, request.proposedChanges, 'location')}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Category</h4>
                    {renderChanges(request.currentValues, request.proposedChanges, 'category')}
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
                    {renderChanges(request.currentValues, request.proposedChanges, 'description')}
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-gray-700 mb-2">Images</h4>
                    {renderChanges(request.currentValues, request.proposedChanges, 'images')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {actionType === 'approve' ? 'Approve' : 'Reject'} Request
            </h3>

            <p className="text-gray-600 mb-4">
              Are you sure you want to {actionType} this service update request for "{selectedRequest.property?.title || 'Property Deleted'}"?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder={`Add a message for the ${actionType} action...`}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 text-white rounded-md ${actionType === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceUpdateRequests;