"use client";

import { useNotification } from "@/components/Toast";

export default function ToastDemo() {
  const notification = useNotification();

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🎉 Toast Notification Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Click the buttons below to see the different toast notification styles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() =>
            notification.success("Operation completed successfully!")
          }
          className="px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
        >
          ✅ Show Success Toast
        </button>

        <button
          onClick={() =>
            notification.error("Something went wrong. Please try again.")
          }
          className="px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
        >
          ❌ Show Error Toast
        </button>

        <button
          onClick={() =>
            notification.warning("Please select a file before continuing.")
          }
          className="px-6 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
        >
          ⚠️ Show Warning Toast
        </button>

        <button
          onClick={() =>
            notification.info("Your request is being processed...")
          }
          className="px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
        >
          ℹ️ Show Info Toast
        </button>
      </div>

      <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          Multiple Toasts Demo
        </h2>
        <button
          onClick={() => {
            notification.info("Processing your request...");
            setTimeout(
              () => notification.warning("This might take a moment..."),
              500
            );
            setTimeout(() => notification.success("All done!"), 1000);
          }}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold shadow-lg transition-all"
        >
          🚀 Show Multiple Toasts
        </button>
      </div>

      <div className="mt-8 p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
          Features:
        </h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
          <li>
            ✨ <strong>Auto-dismiss:</strong> Notifications disappear after 4
            seconds
          </li>
          <li>
            ✨ <strong>Manual close:</strong> Click the X button to dismiss
            immediately
          </li>
          <li>
            ✨ <strong>Stacked:</strong> Multiple notifications can appear at
            once
          </li>
          <li>
            ✨ <strong>Animated:</strong> Smooth slide-in animation from the
            right
          </li>
          <li>
            ✨ <strong>Responsive:</strong> Works on all screen sizes
          </li>
          <li>
            ✨ <strong>Dark mode:</strong> Automatically adapts to your theme
          </li>
        </ul>
      </div>
    </div>
  );
}
