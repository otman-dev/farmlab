"use client";
import React, { useState } from "react";

// Minimal test component to isolate the focus issue
export default function TestInput() {
  const [value, setValue] = useState("");
  
  return (
    <div style={{ padding: "20px" }}>
      <h1>Focus Test</h1>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type here - should NOT lose focus"
        style={{
          padding: "10px",
          border: "1px solid #ccc",
          fontSize: "16px",
          width: "300px"
        }}
      />
      <p>Current value: {value}</p>
    </div>
  );
}