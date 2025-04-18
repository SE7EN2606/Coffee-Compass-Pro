import React, { useEffect, useRef, useState } from 'react';

interface AddCoffeeShopModalProps {
  onClose: () => void;
  onAddShop: (shop: { name: string; address: string; lat: number; lng: number }) => void;
}

const AddCoffeeShopModal: React.FC<AddCoffeeShopModalProps> = ({ onClose, onAddShop }) => {
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (inputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current);
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && place.geometry && place.geometry.location) {
          setShopName(place.name || '');
          setAddress(place.formatted_address || '');
          setLocation({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        }
      });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location) {
      onAddShop({
        name: shopName,
        address,
        lat: location.lat,
        lng: location.lng,
      });
      onClose();
    } else {
      alert('Please select a valid location from the autocomplete suggestions.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add a Coffee Shop</h2>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter coffee shop name"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
          />
          <button type="submit">Add Shop</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default AddCoffeeShopModal;
