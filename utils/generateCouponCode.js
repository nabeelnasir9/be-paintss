const generateCouponCode = (discount, numWords) => {
  const words = [
    'apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew',
    'kiwi', 'lemon', 'mango', 'nectarine', 'orange', 'papaya', 'quince', 'raspberry',
    'strawberry', 'tangerine', 'ugli', 'vanilla', 'watermelon', 'xigua', 'yam', 'zucchini'
  ];
  const selectedWords = [];
  for (let i = 0; i < numWords; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    selectedWords.push(words[randomIndex]);
  }

  return `${selectedWords.join("")}${discount}`;
}
module.exports = generateCouponCode;
