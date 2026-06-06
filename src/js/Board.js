import Column from './Column';
import DragAndDrop from './DragAndDrop';

const STORAGE_KEY = 'trello-board';

// Начальные данные
const defaultData = {
  columns: [
    { id: 'todo', title: 'TODO', cards: [
      'Welcome to Trello!',
      'This is a card.',
      'Click on a card to see what\'s behind it.'
    ] },
    { id: 'in-progress', title: 'IN PROGRESS', cards: [
      'Drag people onto a card to indicate that they\'re responsible for it.',
      'Use color-coded labels for organization',
      'Make as many lists as you need!',
      'Finished with a card? Archive it.',
      'Try dragging cards anywhere.'
    ] },
    { id: 'done', title: 'DONE', cards: [
      'To learn more tricks, check out the guide.',
      'Use as many boards as you want. We\'ll make more!',
      'Want to use keyboard shortcuts? We have them!',
      'Want updates on new features?'
    ] }
  ]
};

export default class Board {
  constructor(container) {
    this.container = container;
    this.columns = [];
    this.dragAndDrop = new DragAndDrop(this);
    this.init();
  }

  init() {
    this.loadFromStorage();
    this.render();
    this.dragAndDrop.init();
  }

  loadFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.data = JSON.parse(saved);
      } catch (e) {
        this.data = defaultData;
      }
    } else {
      this.data = defaultData;
    }
  }

  saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  render() {
    this.container.innerHTML = '';
    this.columns = [];
    
    this.data.columns.forEach((columnData, columnIndex) => {
      const column = new Column(columnData, columnIndex, this);
      this.columns.push(column);
      this.container.appendChild(column.element);
    });
  }

  addCard(columnId, text) {
    const column = this.data.columns.find(col => col.id === columnId);
    if (column && text.trim()) {
      column.cards.push(text.trim());
      this.saveToStorage();
      this.render();
      this.dragAndDrop.init();
    }
  }

  deleteCard(columnId, cardIndex) {
    const column = this.data.columns.find(col => col.id === columnId);
    if (column) {
      column.cards.splice(cardIndex, 1);
      this.saveToStorage();
      this.render();
      this.dragAndDrop.init();
    }
  }

  moveCard(fromColumnId, fromCardIndex, toColumnId, toCardIndex) {
    const fromColumn = this.data.columns.find(col => col.id === fromColumnId);
    const toColumn = this.data.columns.find(col => col.id === toColumnId);
    
    if (fromColumn && toColumn) {
      const [movedCard] = fromColumn.cards.splice(fromCardIndex, 1);
      
      if (toCardIndex === undefined || toCardIndex === null) {
        toColumn.cards.push(movedCard);
      } else {
        toColumn.cards.splice(toCardIndex, 0, movedCard);
      }
      
      this.saveToStorage();
      this.render();
      this.dragAndDrop.init();
    }
  }

  getColumnIndex(columnId) {
    return this.data.columns.findIndex(col => col.id === columnId);
  }

  getCardElement(columnIndex, cardIndex) {
    const column = this.columns[columnIndex];
    if (column && column.cardsList.children[cardIndex]) {
      return column.cardsList.children[cardIndex];
    }
    return null;
  }
}
