"use client";
import { useEffect, useState } from "react";

interface RFIDCard {
  _id: string;
  cardId: string;
  status: "known" | "unknown";
  user?: { _id: string; name: string; email: string };
  detectedAt: string;
  notes?: string;
}

export default function AccessManagementPage() {
  const [cards, setCards] = useState<RFIDCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/dashboard/securitysystem/access");
        const data = await res.json();
        if (res.ok) setCards(data.cards);
        else setError(data.error || "Failed to fetch cards");
      } catch (err) {
        setError((err as Error).message || "Failed to fetch cards");
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-green-700">Access Management</h1>
      {loading && <div className="text-green-600">Loading cards...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card._id} className="bg-white rounded-xl shadow p-4 border border-green-100 flex flex-col gap-2">
            <div className="font-bold text-green-700">Card ID: {card.cardId}</div>
            <div className="text-xs text-gray-500">Status: <span className={card.status === 'known' ? 'text-green-600' : 'text-red-600'}>{card.status}</span></div>
            {card.user && (
              <div className="text-xs text-gray-500">Linked User: {card.user.name} ({card.user.email})</div>
            )}
            <div className="text-xs text-gray-400">Detected: {new Date(card.detectedAt).toLocaleString()}</div>
            {card.notes && <div className="text-xs text-gray-400">Notes: {card.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
