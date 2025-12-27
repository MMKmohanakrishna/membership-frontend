import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planService } from '../services/apiService';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Plans = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: { value: 1, unit: 'months' },
    price: '',
    features: [''],
  });

  const { hasRole } = useAuth();
  const queryClient = useQueryClient();

  const { data: plansData, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => planService.getAll({ isActive: true }),
  });

  const createMutation = useMutation({
    mutationFn: planService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['plans']);
      toast.success('Plan created successfully');
      setShowModal(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create plan');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => planService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['plans']);
      toast.success('Plan updated successfully');
      setShowModal(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update plan');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: planService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['plans']);
      toast.success('Plan deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete plan');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: { value: 1, unit: 'months' },
      price: '',
      features: [''],
    });
    setEditingPlan(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedData = {
      ...formData,
      features: formData.features.filter((f) => f.trim() !== ''),
    };
    
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan._id, data: cleanedData });
    } else {
      createMutation.mutate(cleanedData);
    }
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const plans = plansData?.data?.plans || [];
  const canManagePlans = hasRole('gymowner') || hasRole('staff');

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      duration: plan.duration,
      price: plan.price,
      features: plan.features.length > 0 ? plan.features : [''],
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Membership Plans</h2>
        {canManagePlans && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Plan</span>
          </button>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No plans found
          </div>
        ) : (
          plans.map((plan) => (
            <div key={plan._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                </div>
                {canManagePlans && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit plan"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${plan.name}"?`)) {
                          deleteMutation.mutate(plan._id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                      title="Delete plan"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-primary-600">
                  ₹{plan.price}
                </span>
                <span className="text-gray-600 ml-2">
                  / {plan.duration.value} {plan.duration.unit}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    plan.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingPlan ? 'Edit Plan' : 'Add New Plan'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration Value *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: { ...formData.duration, value: parseInt(e.target.value) },
                      })
                    }
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration Unit *
                  </label>
                  <select
                    value={formData.duration.unit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: { ...formData.duration, unit: e.target.value },
                      })
                    }
                    className="input-field"
                  >
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="input-field flex-1"
                        placeholder="Enter feature"
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="btn-secondary"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="btn-secondary w-full"
                  >
                    Add Feature
                  </button>
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
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn-primary"
                >
                  {(createMutation.isPending || updateMutation.isPending)
                    ? 'Saving...'
                    : editingPlan
                    ? 'Update Plan'
                    : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
