// List of pairs with their belonging image and text
const pairs = [
  { id: 1, image: 'https://i.pinimg.com/474x/3f/29/30/3f2930bf479b2957121a3d509f914634.jpg', text: 'Short-haul flights emit approximately 154 grams of CO₂ per kilometer' },
  { id: 2, image: 'https://st.depositphotos.com/3236579/4310/v/450/depositphotos_43103171-stock-illustration-vector-cartoon-simple-car-on.jpg', text: 'Driving a petrol or diesel car emits 171 grams of CO₂' },
  { id: 3, image: 'https://img.freepik.com/premium-vector/cargo-ship-icon-cartoon-style-white-background_96318-15058.jpg', text: 'Ships accounts for nearly 3% of global greenhouse gas emissions' },
];

// Create one text card and one image card for each pair
const cardData = pairs.flatMap(pair => [
  { id: pair.id, type: 'image', content: pair.image },
  { id: pair.id, type: 'text', content: pair.text }
]);

// Shuffles cards and adds a unique id for DOM-manipulation
const shuffledCards = cardData
  .sort(() => Math.random() - 0.5)
  .map((card, index) => ({ ...card, uniqueId: index }));

  // Gets the container where the cards will be visible
const gameContainer = document.getElementById('memory-game');
// Variables for game handling
let flippedCards = [];
let lockBoard = false;

// Function which creates a card-element based on the type, either text or image
function createCardElement(card) {
  const cardElement = document.createElement('div');
  cardElement.classList.add('memory-card');
  cardElement.dataset.id = card.id;

   // Inserts HTML for the cards front and back page
  cardElement.innerHTML = `
    <div class="card-inner">
      <div class="card-front">
        <div class="card-face card-front-style">
          ${card.type === 'image'
            ? `<img src="${card.content}" alt="Image" style="max-width: 80px; max-height: 100px;">`
            : `<span>${card.content}</span>`}
        </div>
      </div>
      <div class="card-back">
        <div class="card-face card-back-style"></div>
      </div>
    </div>
  `;

  // Add a click event to the card
  cardElement.addEventListener('click', () => handleCardClick(cardElement));
  return cardElement;
}

// This function handles clicks on a card
function handleCardClick(card) {
  //If the board is locked, or the cards are already turned, do nothing
  if (lockBoard || card.classList.contains('flipped')) return;

  card.classList.add('flipped');
  flippedCards.push(card);

  // When 2 cards are turned, check if its a match
  if (flippedCards.length === 2) {
    const [first, second] = flippedCards;
    const isMatch = first.dataset.id === second.dataset.id;

    if (isMatch) {
      flippedCards = []; // If its a match, keep the cards from turning back around
    } else { 
      lockBoard = true; // If its not a match, turn the cards back around after 1 second
      setTimeout(() => {
        first.classList.remove('flipped');
        second.classList.remove('flipped');
        flippedCards = [];
        lockBoard = false;
      }, 1000);
    }
  }
}

// This function sets the game op and inserts the cards in DOM
function setupGame() {
  shuffledCards.forEach(card => {
    const cardEl = createCardElement(card);
    gameContainer.appendChild(cardEl);
  });
}

// When the page is loaded, start the game
document.addEventListener('DOMContentLoaded', setupGame);