import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          <span className="text-primary-500 font-mono">&gt; </span>Welcome, {user?.fullName}!
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-mono text-sm">~/dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Approved Category</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
            {user?.approvedCategoryId ? 'Assigned' : 'Not yet assigned'}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
          <p className="text-lg font-semibold text-green-600 mt-1">Active</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">Student</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Full Name</p>
            <p className="font-medium dark:text-gray-200">{user?.fullName}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Email</p>
            <p className="font-medium dark:text-gray-200">{user?.email}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Department</p>
            <p className="font-medium dark:text-gray-200">{user?.department}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Academic Year</p>
            <p className="font-medium dark:text-gray-200">{user?.academicYear}</p>
          </div>
        </div>
      </Card>

      <p className="text-gray-400 dark:text-gray-500 text-sm text-center mt-8">
        Trainings, modules, and progress tracking — coming in Sprint 2.
      </p>
    </div>
  );
}
