
export default class DragAndDrop {
  constructor(board) {
    this.board = board;
    this.draggedCard = null;
    this.cloneCard = null;
    this.placeholder = null;
    this.dragSourceColumnId = null;
    this.dragSourceCardIndex = null;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.initialMouseX = 0;
    this.initialMouseY = 0;
    this.isDragging = false;
    this.currentTargetList = null;
    this.currentTargetCard = null;
  }

  init() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.addEventListener('mousedown', this.onMouseDown.bind(this));
      card.setAttribute('data-draggable', 'true');
    });
  }

  onMouseDown(e) {
    // Запрещаем перетаскивание при клике на кнопку удаления
    if (e.target.classList.contains('delete-card')) return;
    
    e.preventDefault();
    
    this.draggedCard = e.target.closest('.card');
    if (!this.draggedCard) return;
    
    this.dragSourceColumnId = this.draggedCard.dataset.columnId;
    this.dragSourceCardIndex = parseInt(this.draggedCard.dataset.cardIndex);
    
    // Сохраняем начальную позицию мыши относительно карточки
    const rect = this.draggedCard.getBoundingClientRect();
    this.dragStartX = e.clientX - rect.left;
    this.dragStartY = e.clientY - rect.top;
    
    this.initialMouseX = e.clientX;
    this.initialMouseY = e.clientY;
    
    // Создаём клон карточки для перетаскивания
    this.createDragImage();
    
    this.isDragging = true;
    
    // Добавляем глобальные обработчики
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    
    // Меняем курсор
    document.body.style.cursor = 'grabbing';
    this.draggedCard.classList.add('dragging');
  }

  createDragImage() {
    this.cloneCard = this.draggedCard.cloneNode(true);
    this.cloneCard.classList.add('drag-clone');
    this.cloneCard.style.position = 'fixed';
    this.cloneCard.style.width = `${this.draggedCard.offsetWidth}px`;
    this.cloneCard.style.left = `${this.initialMouseX - this.dragStartX}px`;
    this.cloneCard.style.top = `${this.initialMouseY - this.dragStartY}px`;
    this.cloneCard.style.zIndex = '9999';
    this.cloneCard.style.opacity = '0.8';
    this.cloneCard.style.cursor = 'grabbing';
    this.cloneCard.style.pointerEvents = 'none';
    document.body.appendChild(this.cloneCard);
    
    // Скрываем оригинальную карточку
    this.draggedCard.style.opacity = '0';
    this.draggedCard.style.visibility = 'hidden';
  }

  onMouseMove(e) {
    if (!this.isDragging) return;
    
    // Перемещаем клон
    if (this.cloneCard) {
      this.cloneCard.style.left = `${e.clientX - this.dragStartX}px`;
      this.cloneCard.style.top = `${e.clientY - this.dragStartY}px`;
    }
    
    // Находим элемент под курсором
    const elementUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
    let targetCard = null;
    let targetList = null;
    
    for (const el of elementUnderCursor) {
      if (el.classList && el.classList.contains('card')) {
        targetCard = el;
        break;
      }
      if (el.classList && el.classList.contains('cards-list')) {
        targetList = el;
        break;
      }
    }
    
    // Удаляем старый placeholder
    this.removePlaceholder();
    
    // Создаём новый placeholder
    if (targetCard && targetCard !== this.draggedCard) {
      const rect = targetCard.getBoundingClientRect();
      const insertBefore = e.clientY < rect.top + rect.height / 2;
      
      this.placeholder = document.createElement('div');
      this.placeholder.className = 'card-placeholder';
      this.placeholder.style.height = `${this.draggedCard.offsetHeight}px`;
      
      if (insertBefore) {
        targetCard.parentNode.insertBefore(this.placeholder, targetCard);
      } else {
        targetCard.parentNode.insertBefore(this.placeholder, targetCard.nextSibling);
      }
      this.currentTargetCard = targetCard;
      this.currentTargetList = null;
    } else if (targetList && targetList !== this.draggedCard?.parentNode) {
      this.placeholder = document.createElement('div');
      this.placeholder.className = 'card-placeholder';
      this.placeholder.style.height = `${this.draggedCard.offsetHeight}px`;
      targetList.appendChild(this.placeholder);
      this.currentTargetList = targetList;
      this.currentTargetCard = null;
    }
  }

  onMouseUp(e) {
    if (!this.isDragging) return;
    
    // Убираем глобальные обработчики
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    
    // Находим целевой элемент
    const elementUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
    let targetColumnId = null;
    let targetCardIndex = null;
    
    for (const el of elementUnderCursor) {
      if (el.classList && el.classList.contains('cards-list')) {
        targetColumnId = el.dataset.columnId;
        break;
      }
      if (el.classList && el.classList.contains('column')) {
        targetColumnId = el.dataset.columnId;
        break;
      }
      if (el.classList && el.classList.contains('card')) {
        targetColumnId = el.dataset.columnId;
        break;
      }
    }
    
    // Определяем индекс вставки
    if (this.placeholder && targetColumnId) {
      const parentList = this.placeholder.parentNode;
      const cards = Array.from(parentList.children).filter(child => 
        child.classList && child.classList.contains('card')
      );
      targetCardIndex = cards.indexOf(this.placeholder.previousSibling) + 1;
      if (isNaN(targetCardIndex)) targetCardIndex = 0;
      
      // Выполняем перемещение
      if (targetColumnId && (targetColumnId !== this.dragSourceColumnId || 
          targetCardIndex !== this.dragSourceCardIndex)) {
        this.board.moveCard(
          this.dragSourceColumnId,
          this.dragSourceCardIndex,
          targetColumnId,
          targetCardIndex
        );
      }
    }
    
    // Очищаем всё
    this.removePlaceholder();
    if (this.cloneCard) {
      this.cloneCard.remove();
      this.cloneCard = null;
    }
    
    // Восстанавливаем оригинальную карточку
    if (this.draggedCard) {
      this.draggedCard.style.opacity = '';
      this.draggedCard.style.visibility = '';
      this.draggedCard.classList.remove('dragging');
    }
    
    document.body.style.cursor = '';
    this.isDragging = false;
    this.draggedCard = null;
    this.dragSourceColumnId = null;
    this.dragSourceCardIndex = null;
  }

  removePlaceholder() {
    if (this.placeholder && this.placeholder.parentNode) {
      this.placeholder.parentNode.removeChild(this.placeholder);
    }
    this.placeholder = null;
    this.currentTargetList = null;
    this.currentTargetCard = null;
  }
}
