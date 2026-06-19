import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Card from '../ui/Card';
import type { IRegisterInput } from '@ishub/shared';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState<IRegisterInput>({
    fullName: '',
    email: '',
    password: '',
    department: '',
    academicYear: '',
    preferredCategoryId: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { value: 1, label: 'Cybersecurity' },
    { value: 2, label: 'Development' },
    { value: 3, label: 'Networking' },
    { value: 4, label: 'Creative Works' },
  ];

  const academicYears = [
    { value: '1st Year', label: '1st Year' },
    { value: '2nd Year', label: '2nd Year' },
    { value: '3rd Year', label: '3rd Year' },
    { value: '4th Year', label: '4th Year' },
    { value: '5th Year', label: '5th Year' },
    { value: 'Postgraduate', label: 'Postgraduate' },
  ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!form.department.trim()) newErrors.department = 'Department is required';
    if (!form.academicYear) newErrors.academicYear = 'Academic year is required';
    if (!form.preferredCategoryId || form.preferredCategoryId === 0) {
      newErrors.preferredCategoryId = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await register(form);
      navigate('/pending-approval');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Registration failed. Please try again.';
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof IRegisterInput, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <Card className="max-w-md w-full mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">Create Your Account</h2>
      <p className="text-sm text-slate-400 dark:text-slate-500 text-center mb-6 font-mono">$ register --new</p>

      {serverError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm border border-red-200 dark:border-red-800">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={form.fullName}
          onChange={(e) => updateField('fullName', e.target.value)}
          error={errors.fullName}
        />
        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min. 6 characters"
          value={form.password}
          onChange={(e) => updateField('password', e.target.value)}
          error={errors.password}
        />
        <Input
          label="Department"
          type="text"
          placeholder="e.g., Computer Science"
          value={form.department}
          onChange={(e) => updateField('department', e.target.value)}
          error={errors.department}
        />
        <Select
          label="Academic Year"
          options={academicYears}
          value={form.academicYear}
          onChange={(e) => updateField('academicYear', e.target.value)}
          error={errors.academicYear}
        />
        <Select
          label="Preferred Category"
          options={categories}
          value={form.preferredCategoryId || ''}
          onChange={(e) => updateField('preferredCategoryId', Number(e.target.value))}
          error={errors.preferredCategoryId}
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          Register
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <a href="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
          Login
        </a>
      </p>
    </Card>
  );
}
