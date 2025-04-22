'use client';

import { useEffect, useRef, useState } from 'react';
import { ColourSelector } from '@/components/colour-selector';

const colourMap: Record<string, string> = {
  coral: 'FF7F50',
  '#A67B5B': 'A67B5B',
  teal: '008080',
  black: '000000',
  burlywood: 'DEB887',
};

const originalColour = '#f4a7b9';

export default function Page() {
  const [selectedColour, setSelectedColour] = useState<string>(originalColour);
  const [removeBird, setRemoveBird] = useState(false);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const birdParam = removeBird ? '/e_gen_remove:prompt_bird' : '';
    const backgroundParam = removeBackground ? '/e_background_removal' : '';

    let base = `https://res.cloudinary.com/tamas-demo/image/upload${birdParam}`;
    const filename = '/model4.jpg';

    let hexColour = selectedColour;
    if (selectedColour !== originalColour) {
      if (selectedColour === 'rgb(166, 123, 91)') hexColour = '#A67B5B';
      const hex = colourMap[hexColour] || 'FF7F50';
      base += `/e_gen_recolor:prompt_dress;to-color_${hex}`;
    }

    if (backgroundParam) {
      base += backgroundParam;
    }

    const final = `${base}/f_auto,q_auto,w_390${filename}`;
    setMainImageUrl(final);

    const modalBase = `${base}/f_auto,q_auto${filename}`;
    const paddedModal = removeBackground
      ? modalBase
      : modalBase.replace(
          '/model4.jpg',
          '/c_pad,w_3413,ar_16:9,b_gen_fill/model4.jpg'
        );
    setModalImageUrl(paddedModal);
  }, [selectedColour, removeBird, removeBackground]);

  useEffect(() => {
    if (modalOpen && modalRef.current) {
      modalRef.current.showModal();
    } else if (!modalOpen && modalRef.current) {
      modalRef.current.close();
    }
  }, [modalOpen]);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    console.log('Close modal called');
    setModalOpen(false);
  };

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="details space-y-4">
          <h1 className="text-3xl font-bold">Elegance Flow Dress</h1>
          <p>
            A timeless and elegant dress designed for modern women. Featuring a
            lightweight fabric that flows effortlessly, this dress is perfect
            for any occasion—be it a dinner date, a formal event, or a casual
            day out.
          </p>

          <h3 className="text-lg font-semibold mt-4">Choose Colour:</h3>
          <ColourSelector
            colourMap={colourMap}
            originalColour={originalColour}
            selectedColour={selectedColour}
            onSelect={setSelectedColour}
          />

          <p className="price text-xl mt-4 font-semibold">$89.99</p>
          <button className="btn bg-black text-white py-2 px-4 rounded">
            Add to Cart
          </button>

          <div className="remove-bird mt-4 space-y-2">
            <label className="block">
              <input
                type="checkbox"
                checked={removeBird}
                onChange={(e) => setRemoveBird(e.target.checked)}
                disabled={removeBackground}
              />{' '}
              Remove Bird?
            </label>
            <label className="block">
              <input
                type="checkbox"
                checked={removeBackground}
                onChange={(e) => setRemoveBackground(e.target.checked)}
              />{' '}
              Remove Background?
            </label>
          </div>
        </div>

        <div className="image relative cursor-pointer" onClick={openModal}>
          {mainImageUrl && (
            <>
              <span className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                  />
                  <line
                    x1="12"
                    y1="6"
                    x2="12"
                    y2="18"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <line
                    x1="6"
                    y1="12"
                    x2="18"
                    y2="12"
                    stroke="white"
                    strokeWidth="2"
                  />
                </svg>
              </span>
              <img
                src={mainImageUrl}
                alt="Elegance Flow Dress"
                className="rounded-xl"
              />
            </>
          )}
        </div>
      </div>

      <dialog
        ref={modalRef}
        onClick={(e) => {
          if (e.target === modalRef.current) closeModal();
        }}
        onClose={() => setModalOpen(false)}
        className="z-50 fixed inset-0 m-auto w-[90vw] h-[90vh] max-w-screen-xl max-h-screen bg-transparent backdrop:bg-black/60 backdrop:backdrop-blur-sm outline-none focus:outline-none"
        style={{
          padding: 0,
          border: 'none',
          background: 'transparent',
          outline: 'none',
        }}
      >
        <div
          className="w-full h-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeModal();
            }}
            className="absolute top-4 right-4 z-10 bg-black/70 hover:bg-black text-white rounded-full p-2 transition-colors"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          {modalImageUrl && (
            <img
              src={modalImageUrl}
              alt="Zoomed Dress"
              className="w-full h-full object-contain"
            />
          )}
        </div>
      </dialog>
    </div>
  );
}
