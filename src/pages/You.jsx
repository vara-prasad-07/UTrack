import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase'; // Make sure this path is correct
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import BottomNav from '../components/BottomNav'; // Adjust this import as needed

const You = () => {
  const [userData, setUserData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editMode, setEditMode] = useState({ currency: false, budget: false });
  const [newCurrency, setNewCurrency] = useState('');
  const [newBudget, setNewBudget] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          setNewCurrency(data.usersettings.currency);
          setNewBudget(data.usersettings.montly_budget);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdate = async () => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const userDocRef = doc(db, 'users', uid);

    await updateDoc(userDocRef, {
      usersettings: {
        currency: newCurrency,
        montly_budget: Number(newBudget),
      },
    });

    setEditMode({ currency: false, budget: false });
    setShowSettings(false);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (!userData) return <div className="text-white p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Profile Header */}
      <div className="p-4">
        <div className="bg-[#1f2937] flex items-center gap-4 p-4 rounded-xl shadow">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold uppercase">
            {userData.userdetails.name.charAt(0)}
          </div>
          <div>
            <div className="text-white font-semibold text-md">
              {userData.userdetails.name}
            </div>
            <div className="text-gray-400 text-sm">
              {userData.userdetails.email}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 flex flex-col gap-4">
        <button
          onClick={() => setShowSettings(true)}
          className="bg-[#374151] hover:bg-[#4b5563] text-white py-2 px-4 rounded-lg text-left"
        >
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-lg text-left"
        >
          Logout
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="bg-[#1f2937] text-white rounded-lg p-6 w-[90%] max-w-sm relative">
            <button
              className="absolute top-2 right-3 text-2xl font-bold text-white"
              onClick={() => setShowSettings(false)}
            >
              &times;
            </button>

            <h2 className="text-lg font-bold mb-6 text-center">Edit Settings</h2>

            {/* Currency */}
            <div className="mb-4">
              <label className="block text-sm mb-1">Currency</label>
              {editMode.currency ? (
                <input
                  type="text"
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700 text-white border border-gray-500"
                />
              ) : (
                <div className="flex justify-between items-center bg-gray-800 p-2 rounded">
                  <span>{newCurrency}</span>
                  <button onClick={() => setEditMode({ ...editMode, currency: true })}>
                    ✏️
                  </button>
                </div>
              )}
            </div>

            {/* Budget */}
            <div className="mb-6">
              <label className="block text-sm mb-1">Monthly Budget</label>
              {editMode.budget ? (
                <input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700 text-white border border-gray-500"
                />
              ) : (
                <div className="flex justify-between items-center bg-gray-800 p-2 rounded">
                  <span>{newBudget}</span>
                  <button onClick={() => setEditMode({ ...editMode, budget: true })}>
                    ✏️
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleUpdate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <BottomNav />
      </div>
    </div>
  );
};

export default You;
