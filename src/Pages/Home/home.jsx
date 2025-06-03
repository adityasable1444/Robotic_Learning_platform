import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const cards = [
    { id: 1, title: 'Card 1' },
    { id: 2, title: 'Card 2' },
    { id: 3, title: 'Card 3' },
    { id: 4, title: 'Card 4' },
    { id: 5, title: 'Card 5' },
    { id: 6, title: 'Card 6' },
  ];

  const handleOpenClick = (id) => {
    if (id === 1) {
      navigate('/new-screen'); // Redirect to the new screen
    } else {
      alert(`Clicked on ${cards.find((card) => card.id === id).title}`);
    }
  };

  return (
    <div className="home">
      <div className="cards-container">
        {cards.map((card) => (
          <div key={card.id} className="card">
            <h3>{card.title}</h3>
            <button onClick={() => handleOpenClick(card.id)}>Open</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
