function AccountInfo({ user, memberSince }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Information</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-600 block mb-1">Display Name</label>
          <div className="text-lg text-gray-800 font-medium">{user.displayName}</div>
        </div>
        <div>
          <label className="text-sm text-gray-600 block mb-1">Email</label>
          <div className="text-lg text-gray-800">{user.email}</div>
        </div>
        <div>
          <label className="text-sm text-gray-600 block mb-1">Member Since</label>
          <div className="text-lg text-gray-800">
            {memberSince
              ? memberSince.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : 'Loading...'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountInfo;
