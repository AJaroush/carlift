import { useState } from 'react';

export default function DriverMessageBubble({
  trip,
  driver,
  customPrice,
  dutyTime,
  returnTime,
}) {
  const [copied, setCopied] = useState(false);

  const pickupAddress = trip.pickupLabel || 'TBD';
  const dropoffAddress = trip.dropoffLabel || 'TBD';
  const dutyTimeLabel = dutyTime || trip.timeWindow || 'TBD';
  const returnTimeLabel = returnTime || trip.returnTime || 'TBD';
  const priceValue = customPrice || driver?.price;
  const price = priceValue ? `${priceValue} AED` : 'TBD';
  const seatCount = trip.seatCount || trip.orders?.length || 1;

  const message = `Hi 🙂
I'm looking for ${seatCount} seat${seatCount > 1 ? 's' : ''} on this route daily starting tomorrow:
from ${pickupAddress} to ${dropoffAddress}
Duty time: ${dutyTimeLabel} and Return: ${returnTimeLabel} Price: ${price} per each
Please confirm if you are available.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };

  return (
    <div className="message-bubble driver-bubble">
      <div className="bubble-header">
        <span className="bubble-label">Driver Message</span>
        <button className="copy-btn" onClick={handleCopy} title="Copy message">
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11.667 4.083L5.25 10.5 2.333 7.583" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="4.667" y="4.667" width="7.583" height="7.583" rx="1.167" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M9.333 4.667V2.917A1.167 1.167 0 008.167 1.75H2.917A1.167 1.167 0 001.75 2.917v5.25a1.167 1.167 0 001.167 1.166H4.667" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
          )}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="bubble-text">{message}</pre>
    </div>
  );
}
