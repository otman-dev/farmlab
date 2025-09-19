"use client";

import React from "react";

export default function TodoListPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Farm To-Do List</h1>
      <p className="text-gray-600 mb-8">Track and manage all farm tasks and activities here.</p>
      {/* TODO: Add interactive todo list UI here */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-400">No tasks yet. Add your first farm task!</p>
      </div>
    </div>
  );
}
