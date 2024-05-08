"use client";
import React, { useState } from "react";
import * as fal from "@fal-ai/serverless-client";
import { useEffect } from "react";

fal.config({
  proxyUrl: "/api/proxy",
});

const INPUT_DEFAULTS = {
  _force_msgpack: new Uint8Array([]),
  enable_safety_checker: true,
  image_size: "square_hd",
  sync_mode: true,
  num_images: 1,
  num_inference_steps: "2",
};

const options = {
  gender: ["male", "female"],
  bodyType: ["slim", "obese", "athletic"],
  complexion: ["fair", "dusty", "dark"],
  weather: ["sunny", "rainy", "cold"],
  outfitType: ["casual", "wedding", "beach-wear"],
  region: ["South Asian", "African", "American", "Middle East"]
};

const users = [
  { username: "aarushi", password: "aarushi@123" },
  { username: "abhinav rana", password: "abhinav@123" } 
];

export default function Lightning() {
  const [image, setImage] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({
    gender: "male",
    bodyType: "slim",
    complexion: "fair",
    weather: "sunny",
    outfitType: "casual",
    region: "South Asian"
  });
  const [prompt, setPrompt] = useState("");
  const [seed, setSeed] = useState(Math.floor(Math.random() * 10000000).toFixed(0));
  const [inferenceTime, setInferenceTime] = useState(NaN);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const connection = fal.realtime.connect("fal-ai/fast-lightning-sdxl", {
    connectionKey: "lightning-sdxl",
    throttleInterval: 64,
    onResult: (result) => {
      const blob = new Blob([result.images[0].content], { type: "image/jpeg" });
      setImage(URL.createObjectURL(blob));
      setInferenceTime(result.timings.inference);
    },
  });

  const generatePrompt = () => {
    const { gender, bodyType, complexion, weather, outfitType, region } = selectedOptions;
    return `Generate an image of a ${gender} wearing ${bodyType}-type clothing for a ${complexion}-complex ${region} suitable for ${outfitType} -occasion which would be suitable for ${weather} -weather`
  };

  useEffect(() => {
    const newPrompt = generatePrompt();
    setPrompt(newPrompt);
    connection.send({
      ...INPUT_DEFAULTS,
      prompt: newPrompt,
      seed: Number(seed),
      num_inference_steps: "2"
    });
  }, [selectedOptions]);

  const handleChange = (optionType, value) => {
    setSelectedOptions(prev => ({ ...prev, [optionType]: value }));
  };

  const handleLogin = () => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setLoggedIn(true);
    } else {
      alert("Invalid username or password!");
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return (
      <div className="login-form">
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <main>
      <div className="flex flex-col justify-between h-[calc(100vh-56px)]">
        <div className="py-4 md:py-10 px-0 space-y-4 lg:space-y-8 mx-auto w-full max-w-xl">
          <div className="container px-3 md:px-0 flex flex-col space-y-2">
            {Object.keys(options).map((optionType) => (
              <div key={optionType} className="flex-1 space-y-1">
                <label>{optionType.charAt(0).toUpperCase() + optionType.slice(1)}</label>
                <select
                  onChange={(e) => handleChange(optionType, e.target.value)}
                  className="w-full p-2 border rounded"
                  value={selectedOptions[optionType]}
                >
                  {options[optionType].map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="container flex flex-col space-y-6 lg:flex-row lg:space-y-0 p-3 md:p-0">
            <div className="flex-1 flex-col flex items-center justify-center">
              {image && inferenceTime && (
                <div className="flex flex-row space-x-1 text-sm w-full mb-2">
                  <span className="text-neutral-500">Inference time:</span>
                  <span className={!inferenceTime ? "text-neutral-500" : "text-green-400"}>
                    {inferenceTime ? `${(inferenceTime * 1000).toFixed(0)}ms` : `n/a`}
                  </span>
                </div>
              )}
              <div className="md:min-h-[512px] max-w-fit">
                {image && <img id="imageDisplay" src={image} alt="Dynamic Image" />}
              </div>
            </div>
          </div>
        </div>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </main>
  );
}
