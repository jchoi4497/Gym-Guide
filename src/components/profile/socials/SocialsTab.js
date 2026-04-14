function SocialsTab({ user }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Social Features</h2>

        {/* Coming Soon Message */}
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔗</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Social Features Coming Soon!
          </h3>
          <p className="text-gray-600">
            Connect with friends, share workouts, and compete on leaderboards.
          </p>
        </div>

        {/* Placeholder for future social features */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-800 mb-2">👥 Friends</h4>
            <p className="text-sm text-gray-600">Add and track workouts with friends</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-800 mb-2">🏆 Leaderboards</h4>
            <p className="text-sm text-gray-600">Compete with others in challenges</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-800 mb-2">📊 Share Progress</h4>
            <p className="text-sm text-gray-600">Share your fitness journey</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-800 mb-2">💪 Challenges</h4>
            <p className="text-sm text-gray-600">Join group fitness challenges</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SocialsTab;
