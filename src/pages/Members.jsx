import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberService, planService } from '../services/apiService';
import { toast } from 'react-toastify';
import { Plus, Search, Edit, Trash2, QrCode, X, Download, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { useSearchParams } from 'react-router-dom';

const Members = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [feeStatusFilter, setFeeStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      gender: 'male',
    },
    membership: {
      plan: '',
      startDate: new Date().toISOString().split('T')[0],
    },
    feeStatus: 'paid',
  });

  const queryClient = useQueryClient();

  // Initialize filters from URL params
  useEffect(() => {
    const status = searchParams.get('status');
    const feeStatus = searchParams.get('feeStatus');
    if (status) setStatusFilter(status);
    if (feeStatus) setFeeStatusFilter(feeStatus);
  }, [searchParams]);

  const { data: membersData, isLoading } = useQuery({
    queryKey: ['members', searchQuery, statusFilter, feeStatusFilter],
    queryFn: () => memberService.getAll({ 
      search: searchQuery,
      status: statusFilter,
      feeStatus: feeStatusFilter,
    }),
  });

  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: () => planService.getAll({ isActive: true }),
  });

  const createMutation = useMutation({
    mutationFn: memberService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['members']);
      toast.success('Member created successfully');
      setShowModal(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create member');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: memberService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['members']);
      toast.success('Member deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete member');
    },
  });

  // Renew membership mutation
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewMember, setRenewMember] = useState(null);
  const [renewPlanId, setRenewPlanId] = useState('');

  const renewMutation = useMutation({
    mutationFn: ({ id, planId }) => memberService.renew(id, { planId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['members']);
      toast.success('Membership renewed successfully');
      setShowRenewModal(false);
      setRenewMember(null);
      setRenewPlanId('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to renew membership');
    },
  });

  const resetForm = () => {
    setFormData({
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        gender: 'male',
      },
      membership: {
        plan: '',
        startDate: new Date().toISOString().split('T')[0],
      },
      feeStatus: 'paid',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleShowQR = (member) => {
    setSelectedMember(member);
    setShowQRModal(true);
  };

  const members = membersData?.data?.members || [];
  const plans = plansData?.data?.plans || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Members</h2>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, phone, or member ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="frozen">Frozen</option>
          </select>
          <select
            value={feeStatusFilter}
            onChange={(e) => setFeeStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Fee Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Members List */}
      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No members found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {member.memberId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.personalInfo.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.personalInfo.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.membership?.plan?.name || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.expiryDate
                        ? format(new Date(member.expiryDate), 'PP')
                        : member.membership?.endDate
                        ? format(new Date(member.membership.endDate), 'PP')
                        : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          member.membership?.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : member.membership?.status === 'expired'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {member.membership?.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleShowQR(member)}
                          className="text-primary-600 hover:text-primary-800"
                          title="View QR Code"
                        >
                          <QrCode className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setRenewMember(member);
                            setRenewPlanId(member.membership?.plan?._id || '');
                            setShowRenewModal(true);
                          }}
                          className="text-green-600 hover:text-green-800"
                          title="Renew Membership"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(member._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Add New Member</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, name: e.target.value },
                      })
                    }
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.personalInfo.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, phone: e.target.value },
                      })
                    }
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.personalInfo.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, email: e.target.value },
                      })
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.personalInfo.gender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, gender: e.target.value },
                      })
                    }
                    className="input-field"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membership Plan *
                  </label>
                  <select
                    value={formData.membership.plan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        membership: { ...formData.membership, plan: e.target.value },
                      })
                    }
                    className="input-field"
                    required
                  >
                    <option value="">Select a plan</option>
                    {plans.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.name} - ₹{plan.price ?? '0'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.membership.startDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        membership: { ...formData.membership, startDate: e.target.value },
                      })
                    }
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fee Status
                  </label>
                  <select
                    value={formData.feeStatus}
                    onChange={(e) => setFormData({ ...formData, feeStatus: e.target.value })}
                    className="input-field"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renew Membership Modal */}
      {showRenewModal && renewMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Renew Membership</h3>
              <button onClick={() => setShowRenewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-700">Member: <strong>{renewMember.personalInfo.name}</strong></p>
              <p className="text-sm text-gray-700">Member ID: <strong>{renewMember.memberId}</strong></p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Plan</label>
                <select
                  value={renewPlanId}
                  onChange={(e) => setRenewPlanId(e.target.value)}
                  className="input-field"
                >
                  <option value="">Use current plan</option>
                  {plans.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.name} - ₹{plan.price ?? '0'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button onClick={() => setShowRenewModal(false)} className="btn-secondary">Cancel</button>
                <button
                  onClick={() => renewMutation.mutate({ id: renewMember._id, planId: renewPlanId })}
                  disabled={renewMutation.isLoading}
                  className="btn-primary"
                >
                  {renewMutation.isLoading ? 'Processing...' : 'Confirm Renewal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Member QR Code</h3>
              <button onClick={() => setShowQRModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800 mb-2">
                {selectedMember.personalInfo.name}
              </p>
              <p className="text-sm text-gray-600 mb-4">{selectedMember.memberId}</p>

              <div className="flex justify-center mb-4">
                <img src={selectedMember.qrCode} alt="QR Code" className="w-64 h-64" />
              </div>

              <p className="text-sm text-gray-500 mb-6">
                Scan this code at the entrance for check-in
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={async () => {
                    try {
                      // Create a canvas to combine name, ID, and QR code
                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');
                      
                      // Set canvas size (width: 450px, height: 550px to accommodate text and QR)
                      canvas.width = 450;
                      canvas.height = 550;
                      
                      // Fill white background
                      ctx.fillStyle = '#FFFFFF';
                      ctx.fillRect(0, 0, canvas.width, canvas.height);
                      
                      // Draw member name
                      ctx.fillStyle = '#000000';
                      ctx.font = 'bold 32px Arial';
                      ctx.textAlign = 'center';
                      ctx.fillText(selectedMember.personalInfo.name, canvas.width / 2, 50);
                      
                      // Draw member ID
                      ctx.font = '20px Arial';
                      ctx.fillStyle = '#666666';
                      ctx.fillText(selectedMember.memberId, canvas.width / 2, 85);
                      
                      // Load and draw QR code
                      const qrImage = new Image();
                      qrImage.crossOrigin = 'anonymous';
                      
                      await new Promise((resolve, reject) => {
                        qrImage.onload = () => {
                          // Draw QR code centered below the text
                          const qrSize = 400;
                          const qrX = (canvas.width - qrSize) / 2;
                          const qrY = 120;
                          ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
                          resolve();
                        };
                        qrImage.onerror = reject;
                        qrImage.src = selectedMember.qrCode;
                      });
                      
                      // Convert canvas to blob and download
                      canvas.toBlob((blob) => {
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${selectedMember.personalInfo.name.replace(/\s+/g, '_')}_${selectedMember.memberId}_QR.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                        toast.success('QR Code downloaded successfully');
                      });
                    } catch (error) {
                      toast.error('Failed to download QR code');
                      console.error(error);
                    }
                  }}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={async () => {
                    try {
                      // Create a canvas to combine name, ID, and QR code
                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');
                      
                      // Set canvas size
                      canvas.width = 450;
                      canvas.height = 550;
                      
                      // Fill white background
                      ctx.fillStyle = '#FFFFFF';
                      ctx.fillRect(0, 0, canvas.width, canvas.height);
                      
                      // Draw member name
                      ctx.fillStyle = '#000000';
                      ctx.font = 'bold 32px Arial';
                      ctx.textAlign = 'center';
                      ctx.fillText(selectedMember.personalInfo.name, canvas.width / 2, 50);
                      
                      // Draw member ID
                      ctx.font = '20px Arial';
                      ctx.fillStyle = '#666666';
                      ctx.fillText(selectedMember.memberId, canvas.width / 2, 85);
                      
                      // Load and draw QR code
                      const qrImage = new Image();
                      qrImage.crossOrigin = 'anonymous';
                      
                      await new Promise((resolve, reject) => {
                        qrImage.onload = () => {
                          const qrSize = 400;
                          const qrX = (canvas.width - qrSize) / 2;
                          const qrY = 120;
                          ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
                          resolve();
                        };
                        qrImage.onerror = reject;
                        qrImage.src = selectedMember.qrCode;
                      });
                      
                      // Convert canvas to blob
                      canvas.toBlob(async (blob) => {
                        try {
                          if (navigator.share && navigator.canShare) {
                            const file = new File(
                              [blob], 
                              `${selectedMember.personalInfo.name}_${selectedMember.memberId}_QR.png`, 
                              { type: 'image/png' }
                            );
                            
                            if (navigator.canShare({ files: [file] })) {
                              await navigator.share({
                                title: 'Member QR Code',
                                text: `QR Code for ${selectedMember.personalInfo.name} (${selectedMember.memberId})`,
                                files: [file],
                              });
                              toast.success('QR Code shared successfully');
                            } else {
                              throw new Error('Sharing not supported');
                            }
                          } else {
                            // Fallback: Download instead
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `${selectedMember.personalInfo.name.replace(/\s+/g, '_')}_${selectedMember.memberId}_QR.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                            toast.success('QR Code downloaded (sharing not supported)');
                          }
                        } catch (error) {
                          if (error.name !== 'AbortError') {
                            toast.error('Failed to share QR code');
                          }
                        }
                      });
                    } catch (error) {
                      toast.error('Failed to generate QR code');
                      console.error(error);
                    }
                  }}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
