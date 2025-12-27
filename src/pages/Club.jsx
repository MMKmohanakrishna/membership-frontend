import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Building2, Mail, Phone, MapPin, X, Edit, Trash2, Lock, Unlock, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { gymService } from '../services/apiService';

const Club = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    gymData: {
      name: '',
      description: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      contact: {
        phone: '',
        email: '',
        website: '',
      },
    },
    ownerData: {
      name: '',
      email: '',
      password: '',
      phone: '',
    },
  });

  const queryClient = useQueryClient();

  const { data: gymsData, isLoading } = useQuery({
    queryKey: ['gyms'],
    queryFn: gymService.getAll,
  });

  const createGymMutation = useMutation({
    mutationFn: gymService.create,
    onSuccess: () => {
      toast.success('Club created successfully!');
      queryClient.invalidateQueries(['gyms']);
      setShowModal(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create club');
    },
  });

  const updateGymMutation = useMutation({
    mutationFn: ({ id, data }) => gymService.update(id, data),
    onSuccess: () => {
      toast.success('Club updated successfully');
      queryClient.invalidateQueries(['gyms']);
      setShowModal(false);
      resetForm();
      setEditingGym(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update club');
    },
  });

  const deleteGymMutation = useMutation({
    mutationFn: (id) => gymService.delete(id),
    onSuccess: () => {
      toast.success('Club deactivated successfully');
      queryClient.invalidateQueries(['gyms']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete club');
    },
  });

  const resetForm = () => {
    setFormData({
      gymData: {
        name: '',
        description: '',
        address: { street: '', city: '', state: '', zipCode: '', country: '' },
        contact: { phone: '', email: '', website: '' },
      },
      ownerData: { name: '', email: '', password: '', phone: '' },
    });
  };

  const [editingGym, setEditingGym] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData.gymData,
    };

    if (editingGym) {
      // Update existing gym (do not send owner details here)
      updateGymMutation.mutate({ id: editingGym._id, data: payload });
    } else {
      // Create new gym with owner details
      createGymMutation.mutate({ ...payload, ownerDetails: formData.ownerData });
    }
  };

  const handleEdit = (gym) => {
    setEditingGym(gym);
    setFormData({
      gymData: {
        name: gym.name || '',
        description: gym.description || '',
        address: gym.address || { street: '', city: '', state: '', zipCode: '', country: '' },
        contact: gym.contact || { phone: '', email: '', website: '' },
      },
      ownerData: { name: '', email: '', password: '', phone: '' },
    });
    setShowModal(true);
  };

  const handleDelete = (gym) => {
    if (window.confirm(`Are you sure you want to deactivate "${gym.name}"?`)) {
      // Soft delete (deactivate) - backend will deactivate users as well
      deleteGymMutation.mutate(gym._id);
    }
  };

  const handleToggleBlock = (gym) => {
    const willBlock = gym.isActive;
    const action = willBlock ? 'block' : 'unblock';
    if (window.confirm(`Are you sure you want to ${action} "${gym.name}"?`)) {
      updateGymMutation.mutate({ id: gym._id, data: { isActive: !gym.isActive } });
    }
  };

  const gyms = gymsData?.data?.gyms || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Club Management</h1>
          <p className="text-gray-600 mt-1">Manage all clubs in the system</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Club</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gyms.map((gym) => (
            <div key={gym._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{gym.name}</h3>
                    <p className="text-sm text-gray-500 font-mono">{gym.gymId}</p>
                    <p className="text-sm text-gray-600 mt-1 flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500 mr-1" />
                      <span>{gym.memberCount ?? 0} members</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(gym)}
                    title="Edit club"
                    className="text-blue-600 hover:text-blue-800 p-2 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(gym)}
                    title="Deactivate club"
                    className="text-red-600 hover:text-red-800 p-2 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleBlock(gym)}
                    title={gym.isActive ? 'Block club (prevent login)' : 'Unblock club'}
                    className="text-gray-600 hover:text-gray-800 p-2 rounded"
                  >
                    {gym.isActive ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    gym.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {gym.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {gym.description && (
                <p className="text-gray-600 text-sm mb-4">{gym.description}</p>
              )}

              <div className="space-y-2 text-sm">
                {gym.contact?.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{gym.contact.email}</span>
                  </div>
                )}
                {gym.contact?.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{gym.contact.phone}</span>
                  </div>
                )}
                {gym.address?.city && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>
                      {gym.address.city}, {gym.address.state}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Gym Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{editingGym ? 'Edit Club' : 'Create New Club'}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Club Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Club Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Club Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={formData.gymData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gymData: { ...formData.gymData, name: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      className="input-field"
                      rows="3"
                      value={formData.gymData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gymData: { ...formData.gymData, description: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.gymData.address.street}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gymData: {
                            ...formData.gymData,
                            address: { ...formData.gymData.address, street: e.target.value },
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.gymData.address.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gymData: {
                            ...formData.gymData,
                            address: { ...formData.gymData.address, city: e.target.value },
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.gymData.address.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gymData: {
                            ...formData.gymData,
                            address: { ...formData.gymData.address, state: e.target.value },
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.gymData.address.zipCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gymData: {
                            ...formData.gymData,
                            address: { ...formData.gymData.address, zipCode: e.target.value },
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.gymData.address.country}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gymData: {
                            ...formData.gymData,
                            address: { ...formData.gymData.address, country: e.target.value },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="input-field"
                      value={formData.gymData.contact.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gymData: {
                            ...formData.gymData,
                            contact: { ...formData.gymData.contact, phone: e.target.value },
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      value={formData.gymData.contact.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gymData: {
                            ...formData.gymData,
                            contact: { ...formData.gymData.contact, email: e.target.value },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      className="input-field"
                      value={formData.gymData.contact.website}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gymData: {
                            ...formData.gymData,
                            contact: { ...formData.gymData.contact, website: e.target.value },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Club Owner Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={formData.ownerData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ownerData: { ...formData.ownerData, name: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Owner Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      className="input-field"
                      value={formData.ownerData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ownerData: { ...formData.ownerData, phone: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Owner Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="input-field"
                      value={formData.ownerData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ownerData: { ...formData.ownerData, email: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Owner Password *
                    </label>
                    <input
                      type="password"
                      required
                      className="input-field"
                      value={formData.ownerData.password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ownerData: { ...formData.ownerData, password: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingGym ? 'Update Club' : 'Create Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Club;
