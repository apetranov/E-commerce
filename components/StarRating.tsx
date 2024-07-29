import React from 'react'

interface StarRatingProps {
    rating: number;
}
  
  const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
    const maxStars = 5;
    const stars = [];
  
    for (let i = 0; i < maxStars; i++) {
      stars.push(
        <span key={i} style={{ color: i < rating ? 'gold' : 'gray', fontSize: '24px' }}>
          ★
        </span>
      );
    }
  
    return <div>{stars}</div>;
  };
  
  export default StarRating;