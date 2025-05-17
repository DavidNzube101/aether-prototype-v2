export function getRandomNumber(min: number, max: number) {
 
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new Error('Both min and max must be numbers.');
  }
  
  if (min > max) {
    throw new Error('min must be less than or equal to max.');
  }

  const random = Math.random() * (max - min) + min;

  return random;
}