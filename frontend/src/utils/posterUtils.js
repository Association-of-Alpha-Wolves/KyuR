import QRCode from 'qrcode';

export const generatePoster = async (item) => {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header Banner
  const isLost = item.status === 'lost';
  ctx.fillStyle = isLost ? '#ef4444' : '#22c55e'; // Red for lost, Green for found
  ctx.fillRect(0, 0, canvas.width, 150);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 80px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isLost ? 'MISSING' : 'FOUND', canvas.width / 2, 75);

  // Item Title
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 50px Inter, sans-serif';
  ctx.fillText(item.title, canvas.width / 2, 220);

  let currentY = 280;

  // Draw Image if exists
  if (item.imageUrl) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = item.imageUrl;
      });

      const maxW = 600;
      const maxH = 400;
      const ratio = Math.min(maxW / img.width, maxH / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      const x = (canvas.width - w) / 2;
      
      ctx.drawImage(img, x, currentY, w, h);
      currentY += h + 60;
    } catch (err) {
      console.warn("Could not load image for poster", err);
    }
  }

  // Description
  ctx.fillStyle = '#475569';
  ctx.font = '30px Inter, sans-serif';
  const words = item.description ? item.description.split(' ') : [];
  let line = '';
  const maxWidth = 700;
  
  for (let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + ' ';
    let metrics = ctx.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), canvas.width / 2, currentY);
      line = words[n] + ' ';
      currentY += 40;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), canvas.width / 2, currentY);
  currentY += 80;

  // QR Code
  const itemUrl = `${window.location.origin}/items/${item._id}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(itemUrl, {
      width: 250,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    const qrImg = new Image();
    await new Promise((resolve, reject) => {
      qrImg.onload = resolve;
      qrImg.onerror = reject;
      qrImg.src = qrDataUrl;
    });

    const qrSize = 250;
    ctx.drawImage(qrImg, (canvas.width - qrSize) / 2, currentY, qrSize, qrSize);
    currentY += qrSize + 40;

    ctx.fillStyle = '#1e293b';
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText('Scan this QR code to view details or contact finder', canvas.width / 2, currentY);

  } catch (err) {
    console.error("Error generating QR code", err);
  }

  // Download
  const finalDataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = finalDataUrl;
  a.download = `${isLost ? 'Missing' : 'Found'}-${item.title.replace(/\s+/g, '-')}-Poster.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const generateQRCodeOnly = async (item) => {
  const itemUrl = `${window.location.origin}/items/${item._id}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(itemUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    const isLost = item.status === 'lost';
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${isLost ? 'Missing' : 'Found'}-${item.title.replace(/\s+/g, '-')}-QRCode.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error("Error generating QR code", err);
  }
};
