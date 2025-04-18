import { useEffect, useRef, useState } from 'react';

interface PlaceData {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

const AddCoffeeShopModal = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [placeData, setPlaceData] = useState<PlaceData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!window.google || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment'],
      fields: ['place_id', 'geometry', 'name', 'formatted_address'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) {
        alert('No details available for input: ' + place.name);
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setPlaceData({
        placeId: place.place_id || '',
        name: place.name || '',
        address: place.formatted_address || '',
        lat,
        lng,
      });
    });
  }, []);

  const handleSubmit = async () => {
    if (!placeData) {
      alert("Please select a valid place from the suggestions.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/coffee-shops', { // Update endpoint if needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(placeData),
      });

      if (!response.ok) {
        throw new Error('Failed to add coffee shop.');
      }

      alert('Coffee shop added successfully!');
      window.location.reload(); // Refresh to show new shop
    } catch (error) {
      console.error(error);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Add a Coffee Shop</h2>
      <input
        type="text"
        ref={inputRef}
        placeholder="Enter coffee shop name"
        className="border rounded p-2 w-full mb-4"
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Coffee Shop'}
      </button>
    </div>
  );
};

export default AddCoffeeShopModal;
