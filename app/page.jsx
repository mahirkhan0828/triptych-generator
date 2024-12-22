'use client';

import { useState, useEffect } from 'react';
import styles from './Home.module.css';

export default function Home() {
  const [theme, setTheme] = useState('');
  const [base64Image, setBase64Image] = useState('');
  const [canvasImages, setCanvasImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!theme) {
      alert('Please enter a theme!');
      return;
    }

    setIsLoading(true);
    setBase64Image('');
    setCanvasImages([]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, method: 'sliced' }),
      });

      const result = await response.json();
      if (result.error) {
        alert('Failed to generate images.');
      } else {
        setBase64Image(result.image); // Set the base64 image
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (base64Image) {
      createCanvasImages(base64Image);
    }
  }, [base64Image]);

  const createCanvasImages = (src) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const panelWidth = Math.floor(1792 / 3);

    const img = new Image();
    img.src = src;

    img.onload = () => {
      const newCanvasImages = [];
      for (let i = 0; i < 3; i++) {
        canvas.width = panelWidth;
        canvas.height = 1024;
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        ctx.drawImage(
          img,
          i * panelWidth, 
          0, 
          panelWidth, 
          1024, 
          0, 
          0, 
          panelWidth, 
          1024 
        );
        newCanvasImages.push(canvas.toDataURL()); 
      }
      setCanvasImages(newCanvasImages); // Update state with new images
    };
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Generate Triptych Art</h1>
      <input
        type="text"
        placeholder="Enter Theme (e.g., Ocean, Fantasy)"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className={styles.input}
      />
      <button onClick={handleGenerate} className={styles.generateBtn} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Art'}
      </button>

      {canvasImages.length > 0 && (
        <div className={styles.gallery}>
          {canvasImages.map((imgSrc, index) => (
            <img
              key={index}
              src={imgSrc}
              alt={`Triptych Panel ${index + 1}`}
              className={styles.panel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
