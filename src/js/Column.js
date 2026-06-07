
export default class Column {
  constructor(columnData, columnIndex, board) {
    this.data = columnData;
    this.index = columnIndex;
    this.board = board;
    this.element = null;
    this.cardsList = null;
    this.createElement();
  }

  createElement() {
    this.element = document.createElement('div');
    this.element.className = 'column';
    this.element.dataset.columnId = this.data.id;
    
    // Заголовок
    const header = document.createElement('div');
    header.className = 'column-header';
    header.textContent = this.data.title;
    
    // Список карточек
    this.cardsList = document.createElement('div');
    this.cardsList.className = 'cards-list';
    this.cardsList.dataset.columnId = this.data.id;  // Важно для DnD
    
    // Карточки
    this.data.cards.forEach((cardText, cardIndex) => {
      const card = this.createCardElement(cardText, cardIndex);
      this.cardsList.appendChild(card);
    });
    
    // Кнопка добавления
    const addBtn = document.createElement('button');
    addBtn.className = 'add-card-btn';
    addBtn.textContent = '+ Add another card';
    addBtn.addEventListener('click', () => this.showAddForm());
    
    // Форма добавления
    const addForm = this.createAddForm();
    
    this.element.appendChild(header);
    this.element.appendChild(this.cardsList);
    this.element.appendChild(addBtn);
    this.element.appendChild(addForm);
  }

  createCardElement(text, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = text;
    card.setAttribute('draggable', 'true');
    card.dataset.columnId = this.data.id;
    card.dataset.cardIndex = index;
    
    // Кнопка удаления
    const deleteBtn = document.createElement('span');
    deleteBtn.className = 'delete-card';
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.board.deleteCard(this.data.id, index);
    });
    
    card.appendChild(deleteBtn);
    return card;
  }

  createAddForm() {
    const form = document.createElement('div');
    form.className = 'add-card-form';
    
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Enter a title for this card...';
    
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'form-buttons';
    
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'add-card-confirm';
    confirmBtn.textContent = 'Add Card';
    confirmBtn.addEventListener('click', () => {
      this.board.addCard(this.data.id, textarea.value);
      form.classList.remove('active');
      textarea.value = '';
    });
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'add-card-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
      form.classList.remove('active');
      textarea.value = '';
    });
    
    buttonsDiv.appendChild(confirmBtn);
    buttonsDiv.appendChild(cancelBtn);
    form.appendChild(textarea);
    form.appendChild(buttonsDiv);
    
    return form;
  }

  showAddForm() {
    const form = this.element.querySelector('.add-card-form');
    form.classList.add('active');
    const textarea = form.querySelector('textarea');
    textarea.focus();
  }
}
