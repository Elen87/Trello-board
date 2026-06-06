export default class DragAndDrop {
  constructor(board) {
    this.board = board;
    this.draggedCard = null;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.placeholder = null;
  }

  init() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.addEventListener('dragstart', this.onDragStart.bind(this));
      card.addEventListener('dragend', this.onDragEnd.bind(this));
      card.addEventListener('dragenter', this.onDragEnter.bind(this));
      card.addEventListener('dragover', this.onDragOver.bind(this));
      card.addEventListener('dragleave', this.onDragLeave.bind(this));
      card.setAttribute('draggable', 'true');
    });
  }

  onDragStart(e) {
    this.draggedCard = e.target.closest('.card');
    if (!this.draggedCard) return;
    
    this.dragStartX = e.clientX - this.draggedCard.offsetLeft;
    this.dragStartY = e.clientY - this.draggedCard.offsetTop;
    
    this.draggedCard.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
    
    // Сохраняем данные о перетаскиваемой карточке
    this.dragSourceColumnId = this.draggedCard.dataset.columnId;
    this.dragSourceCardIndex = parseInt(this.draggedCard.dataset.cardIndex);
  }

  onDragEnd(e) {
    if (this.draggedCard) {
      this.draggedCard.classList.remove('dragging');
    }
    this.removePlaceholder();
    this.draggedCard = null;
  }

  onDragEnter(e) {
    e.preventDefault();
    const targetCard = e.target.closest('.card');
    const targetList = e.target.closest('.cards-list');
    
    if (!targetCard && !targetList) return;
    if (targetCard === this.draggedCard) return;
    
    this.removePlaceholder();
    
    if (targetCard) {
      const rect = targetCard.getBoundingClientRect();
      const mouseY = e.clientY;
      const insertBefore = mouseY < rect.top + rect.height / 2;
      
      this.placeholder = document.createElement('div');
      this.placeholder.className = 'card-placeholder';
      
      if (insertBefore) {
        targetCard.parentNode.insertBefore(this.placeholder, targetCard);
      } else {
        targetCard.parentNode.insertBefore(this.placeholder, targetCard.nextSibling);
      }
    } else if (targetList) {
      this.placeholder = document.createElement('div');
      this.placeholder.className = 'card-placeholder';
      targetList.appendChild(this.placeholder);
    }
  }

  onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Обновляем позицию плейсхолдера при движении мыши
    const targetCard = e.target.closest('.card');
    if (targetCard && targetCard !== this.draggedCard && this.placeholder) {
      const rect = targetCard.getBoundingClientRect();
      const mouseY = e.clientY;
      const insertBefore = mouseY < rect.top + rect.height / 2;
      
      if (insertBefore) {
        targetCard.parentNode.insertBefore(this.placeholder, targetCard);
      } else {
        targetCard.parentNode.insertBefore(this.placeholder, targetCard.nextSibling);
      }
    }
  }

  onDragLeave(e) {
    // Не удаляем плейсхолдер при уходе с карточки, если он нужен
  }

  removePlaceholder() {
    if (this.placeholder && this.placeholder.parentNode) {
      this.placeholder.parentNode.removeChild(this.placeholder);
    }
    this.placeholder = null;
  }

  getDropTarget() {
    if (!this.placeholder) return null;
    
    const parentList = this.placeholder.parentNode;
    const columnElement = parentList.closest('.column');
    
    if (!columnElement) return null;
    
    const targetColumnId = columnElement.dataset.columnId;
    const cards = Array.from(parentList.children).filter(child => 
      child.classList && child.classList.contains('card')
    );
    
    const targetCardIndex = this.placeholder.previousSibling && 
      this.placeholder.previousSibling.classList && 
      this.placeholder.previousSibling.classList.contains('card')
      ? cards.indexOf(this.placeholder.previousSibling) + 1
      : 0;
    
    return {
      columnId: targetColumnId,
      cardIndex: targetCardIndex
    };
  }

  completeDrag() {
    const target = this.getDropTarget();
    if (target && this.dragSourceColumnId !== undefined) {
      this.board.moveCard(
        this.dragSourceColumnId,
        this.dragSourceCardIndex,
        target.columnId,
        target.cardIndex
      );
    }
    this.removePlaceholder();
  }
}
